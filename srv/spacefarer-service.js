const skillMultipliers = {
  1: 0.5,
  2: 1,
  3: 1.5,
  4: 2,
  5: 2.5
}

export default (srv) => {
  srv.before('CREATE', 'Spacefarers', (req) => {
    validateAndCalculateStardust(req)
  })
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
