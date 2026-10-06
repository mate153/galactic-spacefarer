/**
 * Puppeteer cache lives inside the project so every clone/CI machine
 * downloads the matching Chrome for Testing on first use / npm install.
 *
 * CommonJS form is required — Puppeteer loads this via require().
 */
const { join } = require('node:path')

/** @type {import("puppeteer").Configuration} */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer')
}
