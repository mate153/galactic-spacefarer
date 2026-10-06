#!/usr/bin/env node
/**
 * Full suite orchestrator: backend (cds-test/mocha) then UI (OPA/Puppeteer).
 * Prints a unified sectioned report and exits non-zero on any failure.
 */
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  startSuite,
  startSection,
  pass,
  fail,
  summary,
  getState
} from './helpers/reporter.js'
import { startServer, stopServer, runOpaSuite } from './ui/run-opa.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BACKEND_RESULTS = join(root, 'test/.results-backend.json')

function runBackend() {
  return new Promise((resolve) => {
    if (existsSync(BACKEND_RESULTS)) {
      try {
        unlinkSync(BACKEND_RESULTS)
      } catch {
        // ignore
      }
    }
    const env = {
      ...process.env,
      CDS_PLUGIN_UI5_ACTIVE: 'false',
      CDS_TEST_SILENT: 'false',
      TEST_RESULTS_FILE: BACKEND_RESULTS
    }
    const child = spawn(
      'npx',
      [
        'mocha',
        '--timeout',
        '60000',
        '--file',
        'test/backend/_hooks.js',
        'test/backend/**/*.test.js'
      ],
      {
        cwd: root,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    )
    child.stdout.on('data', (d) => process.stdout.write(d))
    child.stderr.on('data', (d) => process.stderr.write(d))
    child.on('close', (code) => resolve(code ?? 1))
  })
}

function mergeBackendResults() {
  if (!existsSync(BACKEND_RESULTS)) return
  try {
    const saved = JSON.parse(readFileSync(BACKEND_RESULTS, 'utf8'))
    const state = getState()
    state.passed += saved.passed || 0
    state.failed += saved.failed || 0
    state.skipped += saved.skipped || 0
    for (const f of saved.failures || []) state.failures.push(f)
  } catch {
    // ignore corrupt file
  }
}

async function main() {
  startSuite()
  let exitCode = 0

  // Mark suite started so backend child sections still print under same banner style
  writeFileSync(
    join(root, 'test/.suite-started'),
    '1'
  )

  const backendCode = await runBackend()
  mergeBackendResults()
  if (backendCode !== 0) exitCode = 1

  try {
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
    fail('UI / OPA suite', error)
    exitCode = 1
  } finally {
    await stopServer()
    try {
      unlinkSync(join(root, 'test/.suite-started'))
    } catch {
      // ignore
    }
  }

  const result = summary()
  if (result.failed > 0) exitCode = 1
  process.exit(exitCode)
}

main()
