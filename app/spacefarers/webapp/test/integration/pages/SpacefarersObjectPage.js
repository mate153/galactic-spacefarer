sap.ui.define(
  [
    "sap/fe/test/ObjectPage",
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/actions/Press"
  ],
  function (ObjectPage, Opa5, EnterText, Press) {
    "use strict";

    var CustomPageDefinitions = {
      actions: {
        iEnterStardustCollection: function (sValue) {
          return this.waitFor({
            controlType: "sap.m.Input",
            matchers: function (oInput) {
              var sBinding =
                oInput.getBinding &&
                oInput.getBinding("value") &&
                oInput.getBinding("value").getPath &&
                oInput.getBinding("value").getPath();
              return sBinding === "stardustCollection" && oInput.getEditable && oInput.getEditable();
            },
            actions: new EnterText({ text: String(sValue), clearTextFirst: true }),
            errorMessage: "Editable stardustCollection Input not found"
          });
        },
        iChooseSpacesuitColor: function (sItemText) {
          this.waitFor({
            controlType: "sap.m.Select",
            matchers: function (oSelect) {
              var sBinding =
                oSelect.getBinding &&
                oSelect.getBinding("selectedKey") &&
                oSelect.getBinding("selectedKey").getPath &&
                oSelect.getBinding("selectedKey").getPath();
              return sBinding === "spacesuitColor" && oSelect.getEditable && oSelect.getEditable();
            },
            actions: new Press(),
            errorMessage: "Editable spacesuitColor Select not found"
          });
          return this.waitFor({
            controlType: "sap.ui.core.Item",
            matchers: function (oItem) {
              return (oItem.getText && oItem.getText()) === sItemText;
            },
            actions: new Press(),
            success: function () {
              Opa5.assert.ok(true, "Chose spacesuit color " + sItemText);
            },
            errorMessage: "Spacesuit color item '" + sItemText + "' not found"
          });
        },
      },
      assertions: {
        iSeeFieldLabelContaining: function (sFragment) {
          return this.waitFor({
            controlType: "sap.m.Label",
            check: function (aLabels) {
              return aLabels.some(function (oLabel) {
                return (oLabel.getText() || "").indexOf(sFragment) !== -1;
              });
            },
            success: function () {
              Opa5.assert.ok(true, "Found field label containing: " + sFragment);
            },
            errorMessage: "Field label containing '" + sFragment + "' not found"
          });
        },
        iSeePersistedStardustAndColor: function (sStardust, sColor) {
          return this.waitFor({
            controlType: "sap.m.Input",
            matchers: function (oInput) {
              var sBinding =
                oInput.getBinding &&
                oInput.getBinding("value") &&
                oInput.getBinding("value").getPath &&
                oInput.getBinding("value").getPath();
              if (sBinding !== "stardustCollection") {
                return false;
              }
              // After successful save the field is no longer editable
              return oInput.getEditable && oInput.getEditable() === false;
            },
            success: function (aInputs) {
              var sActual = String(aInputs[0].getValue());
              Opa5.assert.ok(
                Number(sActual) === Number(sStardust),
                "Persisted stardustCollection is " + sActual
              );
              return this.waitFor({
                controlType: "sap.m.Select",
                matchers: function (oSelect) {
                  var sBinding =
                    oSelect.getBinding &&
                    oSelect.getBinding("selectedKey") &&
                    oSelect.getBinding("selectedKey").getPath &&
                    oSelect.getBinding("selectedKey").getPath();
                  return (
                    sBinding === "spacesuitColor" &&
                    oSelect.getEditable &&
                    oSelect.getEditable() === false &&
                    oSelect.getSelectedKey() === sColor
                  );
                },
                success: function () {
                  Opa5.assert.ok(true, "Persisted spacesuitColor is " + sColor);
                },
                errorMessage: "Persisted spacesuitColor '" + sColor + "' not found in display mode"
              });
            },
            errorMessage:
              "stardustCollection did not return to display mode with value " + sStardust
          });
        },
      }
    };

    return new ObjectPage(
      {
        appId: "galactic.spacefarer.spacefarers.spacefarers",
        componentId: "SpacefarersObjectPage",
        contextPath: "/Spacefarers"
      },
      CustomPageDefinitions
    );
  }
);
