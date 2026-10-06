#!/usr/bin/env node
/**
 * Headless OPA runner: starts cds serve (unless TEST_BASE_URL is set),
 * runs QUnit/OPA journeys via Puppeteer, feeds the shared reporter.
 *
 * Chrome for Testing is auto-installed into .cache/puppeteer on first run
 * (see scripts/ensure-chrome.mjs and .puppeteerrc.js).
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { startSuite, startSection, pass, fail, summary } from '../helpers/reporter.js'
import { ensureChrome } from '../../scripts/ensure-chrome.mjs'

const require = createRequire(import.meta.url)
const puppeteer = require('puppeteer')

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const PORT = process.env.TEST_PORT || '4155'
const BASE = process.env.TEST_BASE_URL || `http://127.0.0.1:${PORT}`
const OPA_PATH =
  '/galactic.spacefarer.spacefarers.spacefarers/test/integration/opaTests.qunit.html'

let serverProc = null
let chromePath = null

async function ensureBrowser() {
  if (chromePath) return chromePath
  chromePath = await ensureChrome()
  return chromePath
}

function launchOptions(executablePath) {
  return {
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
}

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { headers: { Authorization: 'Basic aGFuOmhhbg==' } })
      if (res.status < 500) return
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 750))
  }
  throw new Error(`Server did not become ready at ${url}`)
}

export async function startServer() {
  if (process.env.TEST_BASE_URL) return null
  const env = {
    ...process.env,
    PORT,
    CDS_PLUGIN_UI5_ACTIVE: 'true'
  }
  serverProc = spawn('npx', ['cds', 'serve', '--port', PORT], {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let bootLog = ''
  const onData = (d) => {
    bootLog += d.toString()
  }
  serverProc.stdout.on('data', onData)
  serverProc.stderr.on('data', onData)
  try {
    await waitForServer(`${BASE}/odata/v4/spacefarer/`)
  } catch (error) {
    console.error(bootLog)
    throw error
  }
  return serverProc
}

export async function stopServer() {
  if (!serverProc) return
  serverProc.kill('SIGTERM')
  await new Promise((r) => setTimeout(r, 800))
  try {
    serverProc.kill('SIGKILL')
  } catch {
    // already gone
  }
  serverProc = null
}

export async function runOpaSuite({ suite, user, sectionIndex, sectionName }) {
  startSection(sectionIndex, 8, sectionName)
  const executablePath = await ensureBrowser()

  const browser = await puppeteer.launch(launchOptions(executablePath))
  const page = await browser.newPage()
  page.setDefaultTimeout(180000)
  await page.authenticate({ username: user.username, password: user.password })

  await page.exposeFunction('__opaReport', (event) => {
    if (event.type === 'testDone') {
      if (event.failed) {
        fail(event.name, event.message || 'OPA assertion failed')
      } else if (!event.skipped) {
        pass(event.name)
      }
    }
  })

  await page.evaluateOnNewDocument(() => {
    const install = () => {
      if (!window.QUnit || !QUnit.testDone) {
        setTimeout(install, 20)
        return
      }
      if (window.__opaHooksInstalled) return
      window.__opaHooksInstalled = true
      window.__opaFinished = false
      QUnit.testDone((details) => {
        if (typeof window.__opaReport === 'function') {
          const realFailures = (details.assertions || []).filter(
            (a) =>
              !a.result &&
              String(a.message || '') !== 'Script error.' &&
              String(a.message || '').indexOf('Script error') === -1
          )
          window.__opaReport({
            type: 'testDone',
            name: details.module ? `${details.module}: ${details.name}` : details.name,
            failed: realFailures.length > 0,
            skipped: !!details.skipped,
            message: realFailures.map((a) => a.message || 'assertion failed').join('; ')
          })
        }
      })
      QUnit.done(() => {
        window.__opaFinished = true
      })
    }
    install()
  })

  const url = `${BASE}${OPA_PATH}?suite=${encodeURIComponent(suite)}&sap-ui-xx-viewCache=false`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 })

  await page.waitForFunction(() => window.__opaFinished === true, {
    timeout: 420000,
    polling: 1000
  })

  await browser.close()
}

async function main() {
  startSuite()
  let exitCode = 0
  try {
    await ensureBrowser()
    await startServer()
    await runOpaSuite({
      suite: 'list',
      user: { username: 'han', password: 'han' },
      sectionIndex: 6,
      sectionName: 'UI LIST REPORT / PAGINATION / SIGNED-IN'
    })
    await runOpaSuite({
      suite: 'object',
      user: { username: 'han', password: 'han' },
      sectionIndex: 7,
      sectionName: 'UI OBJECT PAGE / EDIT / LABELS'
    })
    await runOpaSuite({
      suite: 'ellen',
      user: { username: 'ellen', password: 'ellen' },
      sectionIndex: 8,
      sectionName: 'UI DATA ISOLATION'
    })
  } catch (error) {
    fail('OPA runner', error)
    exitCode = 1
  } finally {
    await stopServer()
  }
  const result = summary()
  if (result.failed > 0) exitCode = 1
  process.exit(exitCode)
}

export { BASE, OPA_PATH }

if (process.argv[1]?.endsWith('run-opa.mjs')) {
  main()
}
