namespace galactic.spacefarer;

using { cuid, managed } from '@sap/cds/common';

entity Planets : cuid {
  name : String(100) not null;
  spacefarers : Association to many Spacefarers
    on spacefarers.originPlanet = $self;
}

entity Departments : cuid {
  name : String(100) not null;
  spacefarers : Association to many Spacefarers
    on spacefarers.department = $self;
}

entity Positions : cuid {
  name : String(100) not null;
  spacefarers : Association to many Spacefarers
    on spacefarers.position = $self;
}

type SpacesuitColor : String @assert.enum enum {
  BLACK;
  WHITE;
  BLUE;
  RED;
  GREEN;
}

entity Spacefarers : cuid, managed {
  name : String(100) not null;
  email : String(254) not null;
  originPlanet : Association to one Planets not null;
  department : Association to one Departments not null;
  position : Association to one Positions not null;
  carryingCapacity : Integer not null;
  stardustCollection : Decimal(5,1) not null;
  wormholeNavigationSkill : Integer not null;
  spacesuitColor : SpacesuitColor not null;
}
