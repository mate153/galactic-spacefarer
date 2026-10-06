import { GET, POST, PATCH, DELETE, expect, defaults } from '../helpers/cds-app.js'
import { asUser } from '../helpers/auth.js'
import { createAndActivate, draftEdit, entityPath } from '../helpers/draft.js'
import { IDS, SERVICE } from '../helpers/fixtures.js'
import { clearMailbox } from '../helpers/mail.js'
import { startSection, track } from '../helpers/reporter.js'

describe('01 DATA MODEL / SERVICE', function () {
  this.timeout(60000)

  before(() => {
    startSection(1, 8, 'DATA MODEL / SERVICE')
    asUser(defaults, 'han')
  })

  beforeEach(() => clearMailbox())

  it(
    'exposes Spacefarers, Planets, Departments, Positions in metadata',
    track('metadata entities', async () => {
      const { data, status } = await GET(`${SERVICE}/$metadata`, {
        headers: { Accept: 'application/xml' }
      })
      expect(status).to.equal(200)
      const xml = typeof data === 'string' ? data : String(data)
      expect(xml).to.include('EntityType Name="Spacefarers"')
      expect(xml).to.include('EntityType Name="Planets"')
      expect(xml).to.include('EntityType Name="Departments"')
      expect(xml).to.include('EntityType Name="Positions"')
      expect(xml).to.include('NavigationProperty Name="originPlanet"')
      expect(xml).to.include('NavigationProperty Name="department"')
      expect(xml).to.include('NavigationProperty Name="position"')
    })
  )

  it(
    'reads Spacefarers list for authenticated user',
    track('READ list', async () => {
      const { data, status } = await GET(
        `${SERVICE}/Spacefarers?$count=true&$expand=originPlanet,department,position`
      )
      expect(status).to.equal(200)
      expect(Number(data['@odata.count'])).to.equal(17)
      expect(data.value.length).to.be.greaterThan(0)
      expect(data.value[0]).to.have.property('name')
      expect(data.value[0].originPlanet).to.have.property('name', 'Corellia')
    })
  )

  it(
    'creates via draft NEW → PATCH → draftActivate',
    track('draft CREATE + activate', async () => {
      const { activated } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Model Probe',
          email: 'model.probe@galactic-spacefarer.com',
          carryingCapacity: 4,
          wormholeNavigationSkill: 3
        }
      )
      expect(activated.status).to.be.oneOf([200, 201])
      expect(activated.data.IsActiveEntity).to.equal(true)
      expect(activated.data.name).to.equal('Model Probe')
      expect(Number(activated.data.stardustCollection)).to.equal(6)
    })
  )

  it(
    'updates active entity via draftEdit → PATCH → draftActivate',
    track('draftEdit UPDATE', async () => {
      const { id } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Update Probe',
          email: 'update.probe@galactic-spacefarer.com',
          spacesuitColor: 'RED'
        }
      )
      const updated = await draftEdit({ POST, PATCH }, id, {
        spacesuitColor: 'GREEN',
        stardustCollection: 12
      })
      expect(updated.status).to.be.oneOf([200, 201])
      expect(updated.data.spacesuitColor).to.equal('GREEN')
      expect(Number(updated.data.stardustCollection)).to.equal(12)

      const { data } = await GET(entityPath(id, true))
      expect(data.spacesuitColor).to.equal('GREEN')
    })
  )

  it(
    'deletes an active Spacefarer',
    track('DELETE active', async () => {
      const { id } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Delete Probe',
          email: 'delete.probe@galactic-spacefarer.com'
        }
      )
      const del = await DELETE(entityPath(id, true))
      expect(del.status).to.be.oneOf([200, 204])
      const read = await GET(entityPath(id, true), { validateStatus: () => true })
      expect(read.status).to.be.oneOf([404, 403])
    })
  )
})
