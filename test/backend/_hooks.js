import { writeFileSync } from 'node:fs'
import { getState } from '../helpers/reporter.js'

const resultsFile = process.env.TEST_RESULTS_FILE

after(function () {
  if (!resultsFile) return
  const state = getState()
  writeFileSync(
    resultsFile,
    JSON.stringify({
      passed: state.passed,
      failed: state.failed,
      skipped: state.skipped,
      failures: state.failures
    })
  )
})
