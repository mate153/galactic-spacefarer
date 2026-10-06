/**
 * Sectioned console reporter for the assessment test suite.
 * Uses unbuffered console.log so progress appears live.
 */

const state = {
  started: false,
  currentSection: null,
  sections: new Map(),
  passed: 0,
  failed: 0,
  skipped: 0,
  failures: []
}

function write(line = '') {
  console.log(line)
}

export function startSuite(title = 'GALACTIC SPACEFARER — AUTOMATED TEST SUITE') {
  if (state.started) return
  state.started = true
  write()
  write('═'.repeat(72))
  write(` ${title}`)
  write('═'.repeat(72))
  write()
}

export function startSection(index, total, name) {
  const key = `${index}/${total} ${name}`
  state.currentSection = key
  if (!state.sections.has(key)) {
    state.sections.set(key, { name, index, total, passed: 0, failed: 0, skipped: 0, failures: [] })
  }
  write()
  write(`── [${index}/${total}] ${name} ${'─'.repeat(Math.max(4, 52 - name.length))}`)
}

export function pass(name) {
  state.passed += 1
  const section = state.sections.get(state.currentSection)
  if (section) section.passed += 1
  write(`  ✓ ${name}`)
}

export function fail(name, error) {
  state.failed += 1
  const message = formatError(error)
  const entry = { section: state.currentSection, name, message }
  state.failures.push(entry)
  const section = state.sections.get(state.currentSection)
  if (section) {
    section.failed += 1
    section.failures.push(entry)
  }
  write(`  ✗ ${name}`)
  write(`      ${message}`)
}

export function skip(name, reason = '') {
  state.skipped += 1
  const section = state.sections.get(state.currentSection)
  if (section) section.skipped += 1
  write(`  ○ ${name}${reason ? ` (${reason})` : ''}`)
}

export function summary() {
  write()
  write('═'.repeat(72))
  write(' TEST SUMMARY')
  write('═'.repeat(72))
  write(`  Passed : ${state.passed}`)
  write(`  Failed : ${state.failed}`)
  write(`  Skipped: ${state.skipped}`)
  write(`  Total  : ${state.passed + state.failed + state.skipped}`)

  if (state.failures.length) {
    write()
    write(' Failed cases:')
    for (const f of state.failures) {
      write(`  • [${f.section || '?'}] ${f.name}`)
      write(`      ${f.message}`)
    }
  } else {
    write()
    write(' All tests passed.')
  }
  write('═'.repeat(72))
  write()
  return { passed: state.passed, failed: state.failed, skipped: state.skipped }
}

export function getState() {
  return state
}

function formatError(error) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  const msg = error.message || String(error)
  const loc = findLocation(error)
  return loc ? `${msg} (${loc})` : msg
}

function findLocation(error) {
  const stack = error.stack || ''
  const lines = stack.split('\n')
  for (const line of lines) {
    const match = line.match(/\(([^)]+\.(?:js|mjs|cjs|ts)):(\d+):(\d+)\)/) ||
      line.match(/at\s+(?:async\s+)?([^(\s]+\.(?:js|mjs|cjs|ts)):(\d+):(\d+)/)
    if (!match) continue
    const file = match[1]
    if (file.includes('node_modules') || file.includes('node:')) continue
    const short = file.replace(process.cwd() + '/', '')
    return `${short}:${match[2]}`
  }
  return null
}

/**
 * Mocha helper: wrap an async test body so pass/fail is recorded.
 */
export function track(name, fn) {
  return async function tracked() {
    try {
      await fn.call(this)
      pass(name)
    } catch (error) {
      fail(name, error)
      throw error
    }
  }
}
