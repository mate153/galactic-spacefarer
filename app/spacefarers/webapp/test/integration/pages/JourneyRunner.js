sap.ui.define([
  "sap/fe/test/JourneyRunner",
  "galactic/spacefarer/spacefarers/spacefarers/test/integration/pages/SpacefarersList.gen",
  "galactic/spacefarer/spacefarers/spacefarers/test/integration/pages/SpacefarersList",
  "galactic/spacefarer/spacefarers/spacefarers/test/integration/pages/SpacefarersObjectPage"
], function (JourneyRunner, SpacefarersListGenerated, SpacefarersList, SpacefarersObjectPage) {
  "use strict";

  const runner = new JourneyRunner({
    launchUrl:
      sap.ui.require.toUrl("galactic/spacefarer/spacefarers/spacefarers") +
      "/test/flp.html#app-preview",
    pages: {
      onTheSpacefarersListGenerated: SpacefarersListGenerated,
      onTheSpacefarersList: SpacefarersList,
      onTheSpacefarersObjectPage: SpacefarersObjectPage
    },
    async: true,
    opaConfig: {
      autoWait: true,
      timeout: 60
    }
  });

  return runner;
});
