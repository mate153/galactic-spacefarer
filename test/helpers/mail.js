/**
 * Test-only nodemailer stub. Must be imported before the CAP service boots
 * so spacefarer-service.js binds to this transport.
 */
import nodemailer from 'nodemailer'

const mailbox = []
let stubbed = false

export function stubMail() {
  if (stubbed) return
  stubbed = true
  nodemailer.createTransport = () => ({
    sendMail: async (options) => {
      mailbox.push({ ...options })
      return { messageId: `test-${mailbox.length}` }
    }
  })
}

export function getMailbox() {
  return mailbox
}

export function clearMailbox() {
  mailbox.length = 0
}

stubMail()
