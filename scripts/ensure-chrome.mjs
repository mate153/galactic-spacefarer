#!/usr/bin/env node
/**
 * Ensures Puppeteer's Chrome for Testing is available in the project-local
 * cache (.cache/puppeteer). Safe to call repeatedly; no-ops when already installed.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = join(root, '.cache', 'puppeteer')

function withProjectCacheEnv() {
  return {
    ...process.env,
    // Force project-local cache (overrides CI/sandbox defaults)
    PUPPETEER_CACHE_DIR: cacheDir
  }
}

async function executablePath() {
  const puppeteer = require('puppeteer')
  const pathOrPromise = puppeteer.executablePath()
  return typeof pathOrPromise?.then === 'function' ? await pathOrPromise : pathOrPromise
}

export async function ensureChrome() {
  mkdirSync(cacheDir, { recursive: true })
  // Ensure subsequent puppeteer calls in this process use the project cache
  process.env.PUPPETEER_CACHE_DIR = cacheDir

  try {
    const path = await executablePath()
    if (path && existsSync(path)) return path
  } catch {
    // not installed yet
  }

  console.log(`[ensure-chrome] Installing Chrome for Testing into ${cacheDir} …`)
  await new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['puppeteer', 'browsers', 'install', 'chrome'],
      {
        cwd: root,
        env: withProjectCacheEnv(),
        stdio: 'inherit'
      }
    )
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`puppeteer browsers install chrome exited with code ${code}`))
    })
  })

  const path = await executablePath()
  if (!path || !existsSync(path)) {
    throw new Error(
      `Chrome install finished but binary is still missing` +
        (path ? ` at ${path}` : '') +
        `. Check network access to storage.googleapis.com.`
    )
  }
  console.log(`[ensure-chrome] Ready: ${path}`)
  return path
}

const isDirect =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isDirect || process.argv[1]?.endsWith('ensure-chrome.mjs')) {
  ensureChrome().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
