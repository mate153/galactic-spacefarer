sap.ui.define(
  ["sap/ui/test/opaQunit", "./pages/JourneyRunner"],
  function (opaTest, runner) {
    "use strict";

    function journey() {
      QUnit.module("Object Page Journey");

      opaTest("Start application and open first row", function (Given, When, Then) {
        Given.iStartMyApp();
        Then.onTheSpacefarersList.iSeeThisPage();
        When.onTheSpacefarersList.onTable().iPressRow(0);
        Then.onTheSpacefarersObjectPage.iSeeThisPage();
      });

      opaTest("Shows carrying capacity and skill range labels", function (Given, When, Then) {
        Then.onTheSpacefarersObjectPage.iSeeFieldLabelContaining("Carrying Capacity (1–10)");
        Then.onTheSpacefarersObjectPage.iSeeFieldLabelContaining("Wormhole Navigation Skill (1–5)");
      });

      opaTest("Edit and save stardustCollection and spacesuitColor", function (Given, When, Then) {
        When.onTheSpacefarersObjectPage.onHeader().iExecuteEdit();
        Then.onTheSpacefarersObjectPage.iSeeObjectPageInEditMode();
        When.onTheSpacefarersObjectPage.iEnterStardustCollection("9.5");
        When.onTheSpacefarersObjectPage.iChooseSpacesuitColor("Green");
        When.onTheSpacefarersObjectPage.onFooter().iExecuteSave();
        Then.onTheSpacefarersObjectPage.iSeePersistedStardustAndColor("9.5", "GREEN");
      });

      opaTest("Teardown object journey", function (Given, When, Then) {
        Given.iTearDownMyApp();
      });
    }

    runner.run([journey]);
  }
);
