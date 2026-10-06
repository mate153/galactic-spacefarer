using SpacefarerService as service from '../../srv/spacefarer-service';

annotate service.Spacefarers with @(
  UI.HeaderInfo: {
    TypeName: 'Spacefarer',
    TypeNamePlural: 'Spacefarers',
    Title: { Value: name },
    Description: { Value: email }
  },
  UI.Facets: [
    {
      $Type: 'UI.ReferenceFacet',
      Label: 'Identity',
      Target: '@UI.FieldGroup#Identity'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Label: 'Assignment',
      Target: '@UI.FieldGroup#Assignment'
    },
    {
      $Type: 'UI.ReferenceFacet',
      Label: 'Cosmic Profile',
      Target: '@UI.FieldGroup#CosmicProfile'
    }
  ],
  UI.FieldGroup #Identity: {
    Data: [
      { Value: name },
      { Value: email }
    ]
  },
  UI.FieldGroup #Assignment: {
    Data: [
      {
        Value: originPlanet_ID,
        ![@Common.FieldControl]: {$edmJson: {$If: [{$Eq: [{$Path: 'HasActiveEntity'}, false]}, 3, 1]}}
      },
      { Value: department_ID },
      { Value: position_ID }
    ]
  },
  UI.FieldGroup #CosmicProfile: {
    Data: [
      { Value: carryingCapacity, Label: 'Carrying Capacity (1–10)' },
      { Value: wormholeNavigationSkill, Label: 'Wormhole Navigation Skill (1–5)' }
    ]
  },
  UI.LineItem: [
    { Value: name },
    { Value: email },
    { Value: originPlanet.name, Label: 'Origin Planet' },
    { Value: department.name, Label: 'Department' },
    { Value: position.name, Label: 'Position' },
    { Value: carryingCapacity },
    { Value: stardustCollection },
    { Value: wormholeNavigationSkill },
    { Value: spacesuitColor }
  ],
  UI.SelectionFields: [
    name,
    email,
    originPlanet_ID,
    department_ID,
    position_ID,
    stardustCollection,
    spacesuitColor
  ],
  UI.PresentationVariant: {
    SortOrder: [
      { Property: name, Descending: false }
    ],
    Visualizations: ['@UI.LineItem']
  },
  UI.DeleteHidden: true
);

annotate service.Spacefarers with {
  ID @UI.Hidden;
  createdAt @UI.Hidden;
  createdBy @UI.Hidden;
  modifiedAt @UI.Hidden;
  modifiedBy @UI.Hidden;
  name @title: 'Name';
  email @title: 'Email';
  originPlanet @(
    title: 'Origin Planet',
    Common.Text: originPlanet.name,
    Common.TextArrangement: #TextOnly,
    Common.FieldControl: {$edmJson: {$If: [{$Eq: [{$Path: 'HasActiveEntity'}, false]}, 3, 1]}},
    Common.ValueList: {
      CollectionPath: 'Planets',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: originPlanet_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  department @(
    title: 'Department',
    Common.Text: department.name,
    Common.TextArrangement: #TextOnly,
    Common.ValueList: {
      CollectionPath: 'Departments',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: department_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  position @(
    title: 'Position',
    Common.Text: position.name,
    Common.TextArrangement: #TextOnly,
    Common.ValueList: {
      CollectionPath: 'Positions',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: position_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  carryingCapacity @title: 'Carrying Capacity';
  wormholeNavigationSkill @title: 'Wormhole Navigation Skill';
  stardustCollection @(
    title: 'Stardust Collection',
    Common.Documentation: 'Calculated from Carrying Capacity and Wormhole Navigation Skill. On create it is set automatically; while editing you may override it.'
  );
  spacesuitColor @title: 'Spacesuit Color' @Common.ValueListWithFixedValues: true;
};

annotate service.Planets with {
  ID @(
    UI.Hidden,
    Common.Text: name,
    Common.TextArrangement: #TextOnly
  );
};

annotate service.Departments with {
  ID @(
    UI.Hidden,
    Common.Text: name,
    Common.TextArrangement: #TextOnly
  );
};

annotate service.Positions with {
  ID @(
    UI.Hidden,
    Common.Text: name,
    Common.TextArrangement: #TextOnly
  );
};
