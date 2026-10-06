sap.ui.getCore().attachInit(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var suite = params.get("suite") || "list";
  var map = {
    list: "galactic/spacefarer/spacefarers/spacefarers/test/integration/ListReportJourney",
    object: "galactic/spacefarer/spacefarers/spacefarers/test/integration/ObjectPageJourney",
    ellen: "galactic/spacefarer/spacefarers/spacefarers/test/integration/IsolationJourney"
  };
  var moduleName = map[suite] || map.list;

  sap.ui.require([moduleName], function () {
    QUnit.start();
  });
});
