import { GET, POST, PATCH, DELETE, expect, defaults } from '../helpers/cds-app.js'
import { asUser } from '../helpers/auth.js'
import { createAndActivate, draftEdit, entityPath } from '../helpers/draft.js'
import { IDS, SERVICE } from '../helpers/fixtures.js'
import { clearMailbox } from '../helpers/mail.js'
import { startSection, track } from '../helpers/reporter.js'

describe('02 AUTHORIZATION / DATA ISOLATION', function () {
  this.timeout(60000)

  before(() => {
    startSection(2, 8, 'AUTHORIZATION / DATA ISOLATION')
  })

  beforeEach(() => {
    clearMailbox()
    delete defaults.auth
  })

  it(
    'rejects unauthenticated requests with 401',
    track('no auth → 401', async () => {
      const res = await GET(`${SERVICE}/Spacefarers`, { validateStatus: () => true })
      expect(res.status).to.equal(401)
    })
  )

  it(
    'allows han and ellen with valid credentials',
    track('han/ellen → 200', async () => {
      asUser(defaults, 'han')
      const han = await GET(`${SERVICE}/Spacefarers?$top=1`)
      expect(han.status).to.equal(200)

      asUser(defaults, 'ellen')
      const ellen = await GET(`${SERVICE}/Spacefarers?$top=1`)
      expect(ellen.status).to.equal(200)
    })
  )

  it(
    'Han sees only Corellia Spacefarers',
    track('Han Corellia-only isolation', async () => {
      asUser(defaults, 'han')
      const { data } = await GET(
        `${SERVICE}/Spacefarers?$count=true&$expand=originPlanet&$top=100`
      )
      expect(Number(data['@odata.count'])).to.be.at.least(17)
      expect(data.value.length).to.be.greaterThan(0)
      for (const row of data.value) {
        expect(row.originPlanet.name).to.equal('Corellia')
      }
    })
  )

  it(
    'Ellen sees only Earth Spacefarers',
    track('Ellen Earth-only', async () => {
      asUser(defaults, 'ellen')
      const { data } = await GET(
        `${SERVICE}/Spacefarers?$count=true&$expand=originPlanet&$top=100`
      )
      expect(Number(data['@odata.count'])).to.equal(17)
      for (const row of data.value) {
        expect(row.originPlanet.name).to.equal('Earth')
      }
    })
  )

  it(
    'Han cannot GET an Earth Spacefarer by ID',
    track('Han GET Earth ID → 404', async () => {
      asUser(defaults, 'han')
      const res = await GET(entityPath(IDS.ellenRipley, true), { validateStatus: () => true })
      expect(res.status).to.equal(404)
    })
  )

  it(
    'rejects cross-planet CREATE',
    track('cross-planet CREATE → 403', async () => {
      asUser(defaults, 'han')
      const res = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Cross Create',
          email: 'cross.create@galactic-spacefarer.com',
          originPlanet_ID: IDS.earth
        }
      ).catch((e) => e.response || e)
      const status = res.status || res.statusCode
      expect(status).to.be.oneOf([403, 400])
    })
  )

  it(
    'rejects cross-planet UPDATE of origin planet',
    track('cross-planet UPDATE → 403', async () => {
      asUser(defaults, 'han')
      const { id } = await createAndActivate(
        { POST, PATCH },
        {
          name: 'Planet Lock',
          email: 'planet.lock@galactic-spacefarer.com'
        }
      )
      const res = await draftEdit({ POST, PATCH }, id, {
        originPlanet_ID: IDS.earth
      }).catch((e) => e.response || e)
      const status = res.status || res.statusCode
      expect(status).to.be.oneOf([403, 400, 409])
    })
  )

  it(
    'rejects DELETE of another planet’s Spacefarer',
    track('cross-planet DELETE → 404', async () => {
      asUser(defaults, 'han')
      const res = await DELETE(entityPath(IDS.ellenRipley, true), { validateStatus: () => true })
      expect(res.status).to.be.oneOf([404, 403])
    })
  )
})
