import { POST, PATCH, expect, defaults } from '../helpers/cds-app.js'
import { asUser } from '../helpers/auth.js'
import { createAndActivate } from '../helpers/draft.js'
import { clearMailbox, getMailbox } from '../helpers/mail.js'
import { startSection, track } from '../helpers/reporter.js'

describe('05 @After CREATE / EMAIL', function () {
  this.timeout(60000)

  before(() => {
    startSection(5, 8, '@After CREATE / EMAIL')
    asUser(defaults, 'han')
  })

  beforeEach(() => clearMailbox())

  it(
    'sends congratulatory email on successful activate',
    track('success → mailbox to/subject/text', async () => {
      const name = 'Mail Success'
      const email = 'mail.success@galactic-spacefarer.com'
      const { activated } = await createAndActivate(
        { POST, PATCH },
        { name, email, carryingCapacity: 3, wormholeNavigationSkill: 2 }
      )
      expect(activated.status).to.be.oneOf([200, 201])
      const mails = getMailbox()
      expect(mails.length).to.equal(1)
      expect(mails[0].to).to.equal(email)
      expect(mails[0].subject).to.equal('Your cosmic journey has started')
      expect(mails[0].text).to.include('Congratulations')
      expect(mails[0].text).to.include(name)
      expect(mails[0].text).to.include('stars')
    })
  )

  it(
    'does not send email when activate fails validation',
    track('failed activate → no mail', async () => {
      try {
        await createAndActivate(
          { POST, PATCH },
          {
            name: 'Mail Fail',
            email: 'mail.fail@galactic-spacefarer.com',
            carryingCapacity: 0,
            wormholeNavigationSkill: 2
          }
        )
        expect.fail('expected activate to fail')
      } catch (error) {
        expect(error.status || error.response?.status).to.equal(400)
      }
      expect(getMailbox().length).to.equal(0)
    })
  )
})
