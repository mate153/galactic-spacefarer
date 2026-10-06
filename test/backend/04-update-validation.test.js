import { GET, POST, PATCH, expect, defaults } from '../helpers/cds-app.js'
import { asUser } from '../helpers/auth.js'
import { createAndActivate, draftEdit, entityPath } from '../helpers/draft.js'
import { IDS } from '../helpers/fixtures.js'
import { clearMailbox } from '../helpers/mail.js'
import { startSection, track } from '../helpers/reporter.js'

describe('04 UPDATE INPUT VALIDATION', function () {
  this.timeout(60000)

  before(() => {
    startSection(4, 8, 'UPDATE INPUT VALIDATION')
    asUser(defaults, 'han')
  })

  beforeEach(() => clearMailbox())

  it(
    'persists a valid field update',
    track('valid field update persists', async () => {
      const { id } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Update Valid',
          email: 'update.valid@galactic-spacefarer.com',
          spacesuitColor: 'BLACK'
        }
      )
      const updated = await draftEdit({ POST, PATCH }, id, {
        spacesuitColor: 'WHITE',
        stardustCollection: 7.5
      })
      expect(updated.status).to.be.oneOf([200, 201])
      const { data } = await GET(entityPath(id, true))
      expect(data.spacesuitColor).to.equal('WHITE')
      expect(Number(data.stardustCollection)).to.equal(7.5)
    })
  )

  it(
    'rejects invalid email on UPDATE',
    track('invalid email reject', async () => {
      const { id } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Update Email',
          email: 'update.email@galactic-spacefarer.com'
        }
      )
      try {
        await draftEdit({ POST, PATCH }, id, { email: 'bad-email' })
        expect.fail('expected invalid email update to fail')
      } catch (error) {
        expect(error.status || error.response?.status).to.equal(400)
      }
    })
  )

  it(
    'rejects cross-planet origin update',
    track('cross-planet update reject', async () => {
      const { id } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Update Planet',
          email: 'update.planet@galactic-spacefarer.com'
        }
      )
      try {
        await draftEdit({ POST, PATCH }, id, { originPlanet_ID: IDS.earth })
        expect.fail('expected cross-planet update to fail')
      } catch (error) {
        expect(error.status || error.response?.status).to.be.oneOf([403, 400, 409])
      }
    })
  )

  it(
    'does not re-validate capacity/skill ranges on UPDATE (production behavior)',
    track('only rules that exist on UPDATE', async () => {
      const { id, activated } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Update Capacity',
          email: 'update.capacity@galactic-spacefarer.com',
          carryingCapacity: 5,
          wormholeNavigationSkill: 2
        }
      )
      const originalStardust = Number(activated.data.stardustCollection)
      // Production UPDATE does not recalculate stardust or reject out-of-range capacity.
      const updated = await draftEdit({ POST, PATCH }, id, {
        carryingCapacity: 11,
        wormholeNavigationSkill: 6
      })
      expect(updated.status).to.be.oneOf([200, 201])
      expect(Number(updated.data.carryingCapacity)).to.equal(11)
      expect(Number(updated.data.wormholeNavigationSkill)).to.equal(6)
      // stardust is not recalculated on UPDATE unless explicitly patched
      expect(Number(updated.data.stardustCollection)).to.equal(originalStardust)
    })
  )
})
