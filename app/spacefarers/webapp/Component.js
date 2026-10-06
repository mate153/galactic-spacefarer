sap.ui.define(
  ["sap/fe/core/AppComponent", "sap/ui/model/json/JSONModel"],
  function (Component, JSONModel) {
    "use strict";

    return Component.extend("galactic.spacefarer.spacefarers.spacefarers.Component", {
      metadata: {
        manifest: "json"
      },

      init: function () {
        Component.prototype.init.apply(this, arguments);
        this.setModel(
          new JSONModel({
            id: "",
            name: "",
            planet: "",
            summary: ""
          }),
          "signedIn"
        );
        this._loadSignedInUser();
      },

      _loadSignedInUser: function () {
        const oModel = this.getModel();
        const oSignedIn = this.getModel("signedIn");
        if (!oModel || !oSignedIn) {
          return;
        }

        const setUser = function (oUser) {
          const sName = oUser.name || "";
          const sPlanet = oUser.planet || "";
          oSignedIn.setData({
            id: oUser.id || "",
            name: sName,
            planet: sPlanet,
            summary: sPlanet ? sName + " · " + sPlanet : sName
          });
        };

        oModel
          .bindContext("/getCurrentUser(...)")
          .requestObject()
          .then(setUser)
          .catch(function () {
            return fetch(oModel.getServiceUrl() + "getCurrentUser()", {
              credentials: "include",
              headers: { Accept: "application/json" }
            }).then(function (oResponse) {
              if (!oResponse.ok) {
                throw new Error("getCurrentUser failed");
              }
              return oResponse.json();
            }).then(setUser);
          })
          .catch(function () {
            oSignedIn.setData({
              id: "",
              name: "",
              planet: "",
              summary: ""
            });
          });
      }
    });
  }
);
