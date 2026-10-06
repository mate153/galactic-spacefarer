sap.ui.define(
  ["sap/ui/test/opaQunit", "./pages/JourneyRunner"],
  function (opaTest, runner) {
    "use strict";

    function journey() {
      QUnit.module("List Report Journey");

      opaTest("Start application as Han", function (Given, When, Then) {
        Given.iStartMyApp();
        Then.onTheSpacefarersList.iSeeThisPage();
      });

      opaTest("Shows signed-in Han Solo on Corellia and Create", function (Given, When, Then) {
        Then.onTheSpacefarersList.iSeeSignedInUser("Han Solo", "Corellia");
        Then.onTheSpacefarersList.iSeeCreateButton();
      });

      opaTest("Page 1 shows 15 of 17 with pagination controls", function (Given, When, Then) {
        Then.onTheSpacefarersList.iSeeRowCount(15);
        Then.onTheSpacefarersList.iSeeTableTitleCount("15 of 17");
        Then.onTheSpacefarersList.iSeePaginationButton("Previous");
        Then.onTheSpacefarersList.iSeePaginationButton("1");
        Then.onTheSpacefarersList.iSeePaginationButton("2");
        Then.onTheSpacefarersList.iSeePaginationButton("Next");
      });

      opaTest("Next navigates to page 2 with 2 of 17", function (Given, When, Then) {
        When.onTheSpacefarersList.iPressPaginationButton("Next");
        Then.onTheSpacefarersList.iSeeRowCount(2);
        Then.onTheSpacefarersList.iSeeTableTitleCount("2 of 17");
      });

      opaTest("Previous returns to page 1", function (Given, When, Then) {
        When.onTheSpacefarersList.iPressPaginationButton("Previous");
        Then.onTheSpacefarersList.iSeeRowCount(15);
        Then.onTheSpacefarersList.iSeeTableTitleCount("15 of 17");
      });

      opaTest("Page button 2 jumps to second page", function (Given, When, Then) {
        When.onTheSpacefarersList.iPressPaginationButton("2");
        Then.onTheSpacefarersList.iSeeRowCount(2);
        Then.onTheSpacefarersList.iSeeTableTitleCount("2 of 17");
        When.onTheSpacefarersList.iPressPaginationButton("1");
        Then.onTheSpacefarersList.iSeeRowCount(15);
      });

      opaTest("Teardown list journey", function (Given, When, Then) {
        Given.iTearDownMyApp();
      });
    }

    runner.run([journey]);
  }
);
