/**
 * Shared CAP test app boot — import once from backend tests.
 * Stubs mail and disables the UI5 plugin (livereload port conflicts).
 */
process.env.CDS_PLUGIN_UI5_ACTIVE ??= 'false'
process.env.CDS_TEST_SILENT = 'false'

import './mail.js'

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const cds = require('@sap/cds')
const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

export const test = cds.test(root)
export const { GET, POST, PUT, PATCH, DELETE, expect, defaults } = test

defaults.headers = {
  ...(defaults.headers || {}),
  Accept: 'application/json'
}

export { cds }
