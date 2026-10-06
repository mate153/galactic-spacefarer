import { POST, PATCH, expect, defaults } from '../helpers/cds-app.js'
import { asUser } from '../helpers/auth.js'
import { createAndActivate } from '../helpers/draft.js'
import { IDS, skillMultipliers } from '../helpers/fixtures.js'
import { clearMailbox } from '../helpers/mail.js'
import { startSection, track } from '../helpers/reporter.js'

async function expectActivateStatus(payload, allowed) {
  try {
    const { activated } = await createAndActivate({ POST, PATCH }, payload)
    if (!allowed.includes(activated.status)) {
      const err = new Error(`Expected status in [${allowed}], got ${activated.status}`)
      err.response = activated
      throw err
    }
    return activated
  } catch (error) {
    const status = error.status || error.response?.status
    if (status && allowed.includes(status)) return error.response || error
    throw error
  }
}

describe('03 CREATE INPUT VALIDATION', function () {
  this.timeout(60000)

  before(() => {
    startSection(3, 8, 'CREATE INPUT VALIDATION')
    asUser(defaults, 'han')
  })

  beforeEach(() => clearMailbox())

  it(
    'accepts carryingCapacity 1 and 10',
    track('capacity 1/10 ok', async () => {
      const a = await expectActivateStatus(
        {
          name: 'Cap One',
          email: 'cap.one@galactic-spacefarer.com',
          carryingCapacity: 1,
          wormholeNavigationSkill: 1
        },
        [200, 201]
      )
      expect(Number(a.data.stardustCollection)).to.equal(1 * skillMultipliers[1])

      const b = await expectActivateStatus(
        {
          name: 'Cap Ten',
          email: 'cap.ten@galactic-spacefarer.com',
          carryingCapacity: 10,
          wormholeNavigationSkill: 1
        },
        [200, 201]
      )
      expect(Number(b.data.stardustCollection)).to.equal(10 * skillMultipliers[1])
    })
  )

  it(
    'rejects carryingCapacity 0 and 11',
    track('capacity 0/11 reject', async () => {
      await expectActivateStatus(
        {
          name: 'Cap Zero',
          email: 'cap.zero@galactic-spacefarer.com',
          carryingCapacity: 0,
          wormholeNavigationSkill: 2
        },
        [400]
      )
      await expectActivateStatus(
        {
          name: 'Cap Eleven',
          email: 'cap.eleven@galactic-spacefarer.com',
          carryingCapacity: 11,
          wormholeNavigationSkill: 2
        },
        [400]
      )
    })
  )

  it(
    'accepts wormholeNavigationSkill 1 and 5',
    track('skill 1/5 ok', async () => {
      await expectActivateStatus(
        {
          name: 'Skill One',
          email: 'skill.one@galactic-spacefarer.com',
          carryingCapacity: 2,
          wormholeNavigationSkill: 1
        },
        [200, 201]
      )
      await expectActivateStatus(
        {
          name: 'Skill Five',
          email: 'skill.five@galactic-spacefarer.com',
          carryingCapacity: 2,
          wormholeNavigationSkill: 5
        },
        [200, 201]
      )
    })
  )

  it(
    'rejects wormholeNavigationSkill 0 and 6',
    track('skill 0/6 reject', async () => {
      await expectActivateStatus(
        {
          name: 'Skill Zero',
          email: 'skill.zero@galactic-spacefarer.com',
          carryingCapacity: 2,
          wormholeNavigationSkill: 0
        },
        [400]
      )
      await expectActivateStatus(
        {
          name: 'Skill Six',
          email: 'skill.six@galactic-spacefarer.com',
          carryingCapacity: 2,
          wormholeNavigationSkill: 6
        },
        [400]
      )
    })
  )

  it(
    'rejects non-integer capacity/skill',
    track('non-integer reject', async () => {
      await expectActivateStatus(
        {
          name: 'Cap Float',
          email: 'cap.float@galactic-spacefarer.com',
          carryingCapacity: 2.5,
          wormholeNavigationSkill: 2
        },
        [400]
      )
      await expectActivateStatus(
        {
          name: 'Skill Float',
          email: 'skill.float@galactic-spacefarer.com',
          carryingCapacity: 2,
          wormholeNavigationSkill: 2.5
        },
        [400]
      )
    })
  )

  it(
    'rejects invalid email format',
    track('bad email reject', async () => {
      await expectActivateStatus(
        {
          name: 'Bad Email',
          email: 'not-an-email',
          carryingCapacity: 3,
          wormholeNavigationSkill: 2
        },
        [400]
      )
    })
  )

  it(
    'sets stardustCollection = capacity × skill multiplier',
    track('stardust = capacity×multiplier', async () => {
      for (const skill of [1, 2, 3, 4, 5]) {
        const capacity = 4
        const activated = await expectActivateStatus(
          {
            name: `Stardust ${skill}`,
            email: `stardust.${skill}@galactic-spacefarer.com`,
            carryingCapacity: capacity,
            wormholeNavigationSkill: skill
          },
          [200, 201]
        )
        expect(Number(activated.data.stardustCollection)).to.equal(
          capacity * skillMultipliers[skill]
        )
      }
    })
  )

  it(
    'rejects missing or wrong origin planet',
    track('missing/wrong planet reject', async () => {
      await expectActivateStatus(
        {
          name: 'No Planet',
          email: 'no.planet@galactic-spacefarer.com',
          originPlanet_ID: null,
          carryingCapacity: 3,
          wormholeNavigationSkill: 2
        },
        [403, 400]
      )
      await expectActivateStatus(
        {
          name: 'Wrong Planet',
          email: 'wrong.planet@galactic-spacefarer.com',
          originPlanet_ID: IDS.earth,
          carryingCapacity: 3,
          wormholeNavigationSkill: 2
        },
        [403, 400]
      )
    })
  )
})
