import nodemailer from 'nodemailer'

const skillMultipliers = {
  1: 0.5,
  2: 1,
  3: 1.5,
  4: 2,
  5: 2.5
}

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const mailTransport = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false
})

export default (srv) => {
  srv.before('CREATE', 'Spacefarers', (req) => {
    validateEmailFormat(req)
    validateAndCalculateStardust(req)
  })

  srv.before('UPDATE', 'Spacefarers', (req) => {
    validateEmailFormat(req)
  })

  srv.after('CREATE', 'Spacefarers', async (_createdKeys, req) => {
    await sendWelcomeEmail(req.data)
  })
}

function validateEmailFormat(req) {
  const email = req.data.email
  if (typeof email === 'string' && !emailFormat.test(email)) {
    req.error(400, 'Email must be a valid email address.', 'email')
  }
}

function validateAndCalculateStardust(req) {
  const carryingCapacity = req.data.carryingCapacity
  const wormholeNavigationSkill = req.data.wormholeNavigationSkill
  const carryingCapacityIsValid = isLevel(carryingCapacity, 1, 10)
  const wormholeNavigationSkillIsValid = isLevel(wormholeNavigationSkill, 1, 5)

  if (!carryingCapacityIsValid) {
    req.error(400, 'Carrying capacity must be a whole number from 1 to 10.', 'carryingCapacity')
  }
  if (!wormholeNavigationSkillIsValid) {
    req.error(400, 'Wormhole navigation skill must be a whole number from 1 to 5.', 'wormholeNavigationSkill')
  }
  if (!carryingCapacityIsValid || !wormholeNavigationSkillIsValid) return

  req.data.stardustCollection = carryingCapacity * skillMultipliers[wormholeNavigationSkill]
}

function isLevel(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max
}

async function sendWelcomeEmail(spacefarer) {
  try {
    await mailTransport.sendMail({
      from: 'info@galactic-spacefarer.com',
      to: spacefarer.email,
      subject: 'Your cosmic journey has started',
      text: `Congratulations, ${spacefarer.name}. Your adventurous journey among the stars has started.`
    })
  } catch {
    const notificationError = new Error('Unable to send the notification email. The Spacefarer was not created.')
    notificationError.status = 500
    throw notificationError
  }
}
