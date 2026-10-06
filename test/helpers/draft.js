import { IDS } from './fixtures.js'

/**
 * Draft NEW → PATCH → draftActivate for Spacefarers.
 * Validation and after-CREATE email run on draftActivate.
 */
export async function createAndActivate(http, payload, options = {}) {
  const { POST, PATCH } = http
  const draft = await POST('/odata/v4/spacefarer/Spacefarers', {}, options)
  const id = draft.data.ID
  const body = {
    name: payload.name ?? 'Test Spacefarer',
    email: payload.email ?? 'test.spacefarer@galactic-spacefarer.com',
    originPlanet_ID: payload.originPlanet_ID ?? IDS.corellia,
    department_ID: payload.department_ID ?? IDS.departmentNavigation,
    position_ID: payload.position_ID ?? IDS.positionPilot,
    carryingCapacity: payload.carryingCapacity ?? 5,
    wormholeNavigationSkill: payload.wormholeNavigationSkill ?? 2,
    spacesuitColor: payload.spacesuitColor ?? 'BLUE',
    ...payload
  }
  // stardustCollection is calculated on CREATE; omit unless explicitly set for negative cases
  if (payload.stardustCollection !== undefined) {
    body.stardustCollection = payload.stardustCollection
  }

  await PATCH(`/odata/v4/spacefarer/Spacefarers(ID=${id},IsActiveEntity=false)`, body, options)
  const activated = await POST(
    `/odata/v4/spacefarer/Spacefarers(ID=${id},IsActiveEntity=false)/draftActivate`,
    {},
    options
  )
  return { id, draft, activated }
}

export async function draftEdit(http, id, patch, options = {}) {
  const { POST, PATCH } = http
  await POST(`/odata/v4/spacefarer/Spacefarers(ID=${id},IsActiveEntity=true)/draftEdit`, {
    PreserveChanges: false
  }, options)
  if (patch && Object.keys(patch).length) {
    await PATCH(`/odata/v4/spacefarer/Spacefarers(ID=${id},IsActiveEntity=false)`, patch, options)
  }
  return POST(
    `/odata/v4/spacefarer/Spacefarers(ID=${id},IsActiveEntity=false)/draftActivate`,
    {},
    options
  )
}

export function entityPath(id, isActive = true) {
  return `/odata/v4/spacefarer/Spacefarers(ID=${id},IsActiveEntity=${isActive})`
}
