sap.ui.define(
  [
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/MessageBox"
  ],
  function (ControllerExtension, MessageBox) {
    "use strict";

    const skillMultipliers = {
      1: 0.5,
      2: 1,
      3: 1.5,
      4: 2,
      5: 2.5
    };

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return ControllerExtension.extend(
      "galactic.spacefarer.spacefarers.spacefarers.ext.controller.SpacefarerObjectPage",
      {
        override: {
          onPageReady: function () {
            this._attachStardustPropertyObserver();
          },

          routing: {
            onAfterBinding: function () {
              this._observedContextPath = null;
              this._attachStardustPropertyObserver();
            }
          },

          editFlow: {
            onBeforeSave: function () {
              return this._validateBeforeSave();
            }
          }
        },

        onNavToList: function () {
          this.base.getAppComponent().getRouter().navTo("SpacefarersList");
        },

        _attachStardustPropertyObserver: function () {
          const bindingContext = this.base.getView().getBindingContext();
          if (!bindingContext) {
            return;
          }

          const contextPath = bindingContext.getPath();
          if (this._observedContextPath === contextPath) {
            return;
          }

          const model = bindingContext.getModel();
          if (this._propertyChangeHandler) {
            model.detachPropertyChange(this._propertyChangeHandler);
          }

          this._observedContextPath = contextPath;
          this._lastCapacity = bindingContext.getProperty("carryingCapacity");
          this._lastSkill = bindingContext.getProperty(
            "wormholeNavigationSkill"
          );

          this._propertyChangeHandler = function (event) {
            const path = event.getParameter("path") || "";
            const eventContext = event.getParameter("context");
            const sameContext =
              !eventContext || eventContext.getPath() === contextPath;

            if (
              !sameContext ||
              (!path.includes("carryingCapacity") &&
                !path.includes("wormholeNavigationSkill"))
            ) {
              return;
            }

            this._recalculateStardustIfDriversChanged();
          }.bind(this);

          model.attachPropertyChange(this._propertyChangeHandler);
        },

        _recalculateStardustIfDriversChanged: function () {
          const bindingContext = this.base.getView().getBindingContext();
          if (!bindingContext || this._updatingStardust) {
            return;
          }

          const carryingCapacity = Number(
            bindingContext.getProperty("carryingCapacity")
          );
          const wormholeNavigationSkill = Number(
            bindingContext.getProperty("wormholeNavigationSkill")
          );

          if (
            carryingCapacity === Number(this._lastCapacity) &&
            wormholeNavigationSkill === Number(this._lastSkill)
          ) {
            return;
          }

          this._lastCapacity = carryingCapacity;
          this._lastSkill = wormholeNavigationSkill;
          this._recalculateStardust();
        },

        _recalculateStardust: function () {
          const bindingContext = this.base.getView().getBindingContext();
          if (!bindingContext || this._updatingStardust) {
            return;
          }

          const carryingCapacity = Number(
            bindingContext.getProperty("carryingCapacity")
          );
          const wormholeNavigationSkill = Number(
            bindingContext.getProperty("wormholeNavigationSkill")
          );

          if (
            !this._isLevel(carryingCapacity, 1, 10) ||
            !this._isLevel(wormholeNavigationSkill, 1, 5)
          ) {
            return;
          }

          const stardustCollection =
            carryingCapacity * skillMultipliers[wormholeNavigationSkill];

          this._lastCapacity = carryingCapacity;
          this._lastSkill = wormholeNavigationSkill;
          this._updatingStardust = true;
          Promise.resolve(
            bindingContext.setProperty("stardustCollection", stardustCollection)
          ).finally(
            function () {
              this._updatingStardust = false;
            }.bind(this)
          );
        },

        _validateBeforeSave: function () {
          const bindingContext = this.base.getView().getBindingContext();
          if (!bindingContext) {
            return Promise.resolve();
          }

          const email = bindingContext.getProperty("email");
          const carryingCapacity = Number(
            bindingContext.getProperty("carryingCapacity")
          );
          const wormholeNavigationSkill = Number(
            bindingContext.getProperty("wormholeNavigationSkill")
          );
          const i18n = this.base.getView().getModel("i18n");

          if (typeof email === "string" && email && !emailFormat.test(email)) {
            MessageBox.error(i18n.getProperty("validationEmailInvalid"));
            return Promise.reject();
          }

          if (!this._isLevel(carryingCapacity, 1, 10)) {
            MessageBox.error(i18n.getProperty("validationCapacityInvalid"));
            return Promise.reject();
          }

          if (!this._isLevel(wormholeNavigationSkill, 1, 5)) {
            MessageBox.error(i18n.getProperty("validationSkillInvalid"));
            return Promise.reject();
          }

          return Promise.resolve();
        },

        _isLevel: function (value, min, max) {
          return Number.isInteger(value) && value >= min && value <= max;
        }
      }
    );
  }
);
