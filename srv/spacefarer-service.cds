using { galactic.spacefarer as db } from '../db/schema';

service SpacefarerService @(requires: 'authenticated-user') {
  @restrict: [
    {
      grant: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
      to: 'authenticated-user',
      where: 'originPlanet.name = $user.planet'
    }
  ]
  @odata.draft.enabled
  entity Spacefarers as projection on db.Spacefarers;

  entity Planets as projection on db.Planets;
  entity Departments as projection on db.Departments;
  entity Positions as projection on db.Positions;
}

annotate SpacefarerService.Spacefarers with {
  originPlanet @immutable;
}
