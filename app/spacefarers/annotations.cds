using SpacefarerService as service from '../../srv/spacefarer-service';

annotate service.Spacefarers with @(
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
  UI.CreateHidden: true,
  UI.UpdateHidden: true,
  UI.DeleteHidden: true
);

annotate service.Spacefarers with {
  name @title: 'Name';
  email @title: 'Email';
  originPlanet @(
    title: 'Origin Planet',
    Common.Text: originPlanet.name,
    Common.TextArrangement: #TextOnly,
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
  stardustCollection @title: 'Stardust Collection';
  wormholeNavigationSkill @title: 'Wormhole Navigation Skill';
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
