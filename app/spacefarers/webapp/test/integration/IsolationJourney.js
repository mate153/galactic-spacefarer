sap.ui.define(
  ["sap/ui/test/opaQunit", "./pages/JourneyRunner"],
  function (opaTest, runner) {
    "use strict";

    function journey() {
      QUnit.module("UI Data Isolation Journey");

      opaTest("As Ellen, list shows Earth isolation (17 Earth rows, signed-in Ellen)", function (
        Given,
        When,
        Then
      ) {
        Given.iStartMyApp();
        Then.onTheSpacefarersList.iSeeThisPage();
        Then.onTheSpacefarersList.iSeeSignedInUser("Ellen Ripley", "Earth");
        Then.onTheSpacefarersList.iSeeTableTitleCount("of 17");
        Then.onTheSpacefarersList.iSeeRowCount(15);
        Given.iTearDownMyApp();
      });
    }

    runner.run([journey]);
  }
);
