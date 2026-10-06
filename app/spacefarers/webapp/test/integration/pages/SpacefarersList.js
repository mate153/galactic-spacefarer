sap.ui.define(
  [
    "sap/fe/test/ListReport",
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/PropertyStrictEquals"
  ],
  function (ListReport, Opa5, Press, PropertyStrictEquals) {
    "use strict";

    var CustomPageDefinitions = {
      actions: {
        iPressPaginationButton: function (sText) {
          return this.waitFor({
            controlType: "sap.m.Button",
            visible: true,
            enabled: null,
            matchers: new PropertyStrictEquals({ name: "text", value: sText }),
            actions: new Press(),
            errorMessage: "Pagination button '" + sText + "' not found"
          });
        },
        iPressCreate: function () {
          return this.waitFor({
            controlType: "sap.m.Button",
            matchers: function (oButton) {
              var sId = oButton.getId() || "";
              var sText = (oButton.getText && oButton.getText()) || "";
              var sTooltip = (oButton.getTooltip && oButton.getTooltip()) || "";
              return (
                sId.indexOf("Create") !== -1 ||
                sText === "Create" ||
                sTooltip === "Create"
              );
            },
            actions: new Press(),
            errorMessage: "Create button not found"
          });
        }
      },
      assertions: {
        iSeeTableTitleCount: function (sExpected) {
          return this.waitFor({
            controlType: "sap.ui.table.Table",
            success: function (aTables) {
              var oTable = aTables[0];
              var sTitle = "";
              if (oTable.getTitle) {
                var vTitle = oTable.getTitle();
                if (typeof vTitle === "string") {
                  sTitle = vTitle;
                } else if (vTitle && vTitle.getText) {
                  sTitle = vTitle.getText();
                }
              }
              if (oTable.getAggregation && oTable.getAggregation("title")) {
                var oAgg = oTable.getAggregation("title");
                if (oAgg && oAgg.getText) {
                  sTitle = oAgg.getText();
                }
              }
              // Fall back to any Text control near the table header
              if (!sTitle || sTitle.indexOf(sExpected) === -1) {
                return this.waitFor({
                  controlType: "sap.m.Title",
                  check: function (aTitles) {
                    return aTitles.some(function (oTitle) {
                      return (oTitle.getText() || "").indexOf(sExpected) !== -1;
                    });
                  },
                  success: function () {
                    Opa5.assert.ok(true, "Table title contains: " + sExpected);
                  },
                  errorMessage: "Table title '" + sExpected + "' not found (got '" + sTitle + "')"
                });
              }
              Opa5.assert.ok(
                sTitle.indexOf(sExpected) !== -1,
                "Table title is '" + sTitle + "'"
              );
            },
            errorMessage: "Grid table not found for title check"
          });
        },

        iSeePaginationButton: function (sText) {
          return this.waitFor({
            controlType: "sap.m.Button",
            visible: true,
            enabled: null,
            matchers: new PropertyStrictEquals({ name: "text", value: sText }),
            success: function () {
              Opa5.assert.ok(true, "Pagination button visible: " + sText);
            },
            errorMessage: "Pagination button '" + sText + "' not found"
          });
        },

        iSeeRowCount: function (iExpected) {
          return this.waitFor({
            controlType: "sap.ui.table.Table",
            check: function (aTables) {
              var oBinding = aTables[0].getBinding("rows");
              return oBinding && oBinding.getLength() === iExpected;
            },
            success: function (aTables) {
              Opa5.assert.strictEqual(
                aTables[0].getBinding("rows").getLength(),
                iExpected,
                "Table shows " + iExpected + " rows"
              );
            },
            errorMessage: "Table does not show " + iExpected + " rows"
          });
        },

        iSeeSignedInUser: function (sName, sPlanet) {
          return this.waitFor({
            controlType: "sap.m.ObjectAttribute",
            check: function (aAttrs) {
              var aTexts = aAttrs.map(function (a) {
                return ((a.getTitle && a.getTitle()) || "") + "|" + ((a.getText && a.getText()) || "");
              });
              var bName = aTexts.some(function (t) {
                return t.indexOf(sName) !== -1;
              });
              var bPlanet = !sPlanet || aTexts.some(function (t) {
                return t.indexOf(sPlanet) !== -1;
              });
              return bName && bPlanet;
            },
            success: function () {
              Opa5.assert.ok(
                true,
                "Signed-in header shows " + sName + (sPlanet ? " / " + sPlanet : "")
              );
            },
            errorMessage: "Signed-in header missing " + sName + " / " + sPlanet
          });
        },

        iSeeCreateButton: function () {
          return this.waitFor({
            controlType: "sap.m.Button",
            matchers: function (oButton) {
              var sId = oButton.getId() || "";
              var sText = (oButton.getText && oButton.getText()) || "";
              return sId.indexOf("Create") !== -1 || sText === "Create";
            },
            success: function () {
              Opa5.assert.ok(true, "Create button is visible");
            },
            errorMessage: "Create button not visible"
          });
        }
      }
    };

    return new ListReport(
      {
        appId: "galactic.spacefarer.spacefarers.spacefarers",
        componentId: "SpacefarersList",
        contextPath: "/Spacefarers"
      },
      CustomPageDefinitions
    );
  }
);
