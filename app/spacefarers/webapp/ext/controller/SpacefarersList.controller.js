sap.ui.define(
  [
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/VBox",
    "sap/m/ObjectAttribute",
    "sap/m/OverflowToolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
  ],
  function (
    ControllerExtension,
    VBox,
    ObjectAttribute,
    OverflowToolbar,
    ToolbarSpacer,
    Button,
    JSONModel,
    Filter,
    FilterOperator,
    FilterType
  ) {
    "use strict";

    const PAGE_SIZE = 15;

    return ControllerExtension.extend(
      "galactic.spacefarer.spacefarers.spacefarers.ext.controller.SpacefarersList",
      {
        override: {
          onInit: function () {
            this.base.getView().setModel(
              new JSONModel({
                currentPage: 1,
                totalPages: 1,
                totalCount: 0,
                prevEnabled: false,
                nextEnabled: false
              }),
              "pagination"
            );
          },

          onPageReady: function () {
            this._ensureSignedInHeader();
            this._bootstrapPagination();
          },

          routing: {
            onAfterBinding: function () {
              this._ensureSignedInHeader();
              this._bootstrapPagination();
            }
          }
        },

        onPaginationPrevious: function () {
          this._goToPage(this._getPaginationModel().getProperty("/currentPage") - 1);
        },

        onPaginationNext: function () {
          this._goToPage(this._getPaginationModel().getProperty("/currentPage") + 1);
        },

        onPaginationPage: function (oEvent) {
          const iPage = Number(oEvent.getSource().data("page"));
          if (iPage) {
            this._goToPage(iPage);
          }
        },

        _getPaginationModel: function () {
          return this.base.getView().getModel("pagination");
        },

        _ensureSignedInHeader: function () {
          if (this._signedInHeaderAdded) {
            return;
          }

          const oDynamicPage = this._findControl((oControl) => oControl.isA("sap.f.DynamicPage"));
          const oTitle = oDynamicPage && oDynamicPage.getTitle && oDynamicPage.getTitle();
          if (!oTitle || !oTitle.addExpandedContent) {
            return;
          }

          oTitle.addExpandedContent(
            new VBox({
              items: [
                new ObjectAttribute({
                  title: "{i18n>signedInAs}",
                  text: "{signedIn>/name}"
                }),
                new ObjectAttribute({
                  title: "{i18n>signedInPlanet}",
                  text: "{signedIn>/planet}"
                })
              ]
            })
          );
          oTitle.addSnappedContent(
            new ObjectAttribute({
              title: "{i18n>signedInAs}",
              text: "{signedIn>/summary}"
            })
          );
          this._signedInHeaderAdded = true;
        },

        _bootstrapPagination: function () {
          const oTable = this._findControl(
            (oControl) =>
              oControl.isA("sap.ui.table.Table") &&
              String(oControl.getId()).includes("LineItem-innerTable")
          );
          if (!oTable) {
            return;
          }

          this._table = oTable;
          oTable.setVisibleRowCountMode("Fixed");
          oTable.setVisibleRowCount(PAGE_SIZE);
          this._ensurePaginationToolbar(oTable);
          this._ensureFilterBarHook();
          this._ensureSortHook(oTable);
          this._ensureTitleCountHook(oTable);
          this._startPagingWhenBound(oTable);
        },

        _ensureTitleCountHook: function (oTable) {
          if (this._titleCountHooked) {
            return;
          }
          const oBinding = oTable.getBinding("rows");
          if (!oBinding) {
            setTimeout(() => {
              this._ensureTitleCountHook(oTable);
            }, 50);
            return;
          }
          this._titleCountHooked = true;
          oBinding.attachEvent("change", () => {
            setTimeout(() => {
              this._updateTableTitleCount();
            }, 0);
          });
        },

        _ensurePaginationToolbar: function (oTable) {
          if (this._paginationToolbar) {
            if (typeof oTable.setFooter === "function" && oTable.getFooter() !== this._paginationToolbar) {
              oTable.setFooter(this._paginationToolbar);
            }
            return;
          }

          this._paginationToolbar = new OverflowToolbar({
            style: "Clear",
            content: [new ToolbarSpacer()]
          });

          if (typeof oTable.setFooter === "function") {
            oTable.setFooter(this._paginationToolbar);
          }

          this._rebuildPaginationButtons();
        },

        _ensureFilterBarHook: function () {
          if (this._filterBarHooked) {
            return;
          }

          const oFilterBar = this._findControl(
            (oControl) =>
              oControl.isA("sap.ui.mdc.FilterBar") &&
              String(oControl.getId()).includes("FilterBar::Spacefarers")
          );
          if (!oFilterBar || typeof oFilterBar.attachSearch !== "function") {
            return;
          }

          this._filterBarHooked = true;
          oFilterBar.attachSearch(() => {
            this._scheduleReloadAfterBindingChange(1);
          });
        },

        _ensureSortHook: function (oTable) {
          if (this._sortHooked || typeof oTable.attachSort !== "function") {
            return;
          }
          this._sortHooked = true;
          oTable.attachSort(() => {
            this._scheduleReloadAfterBindingChange(1);
          });
        },

        _startPagingWhenBound: function (oTable) {
          if (this._pagingStarted) {
            return;
          }

          const fnTryStart = () => {
            if (this._pagingStarted) {
              return;
            }
            const oBinding = oTable.getBinding("rows");
            if (!oBinding) {
              setTimeout(fnTryStart, 50);
              return;
            }

            this._pagingStarted = true;
            this._captureBindingState(oBinding);

            if (typeof oBinding.suspend === "function" && !oBinding.isSuspended()) {
              oBinding.suspend();
            }

            this._loadServerPage(1).finally(() => {
              if (typeof oBinding.resume === "function" && oBinding.isSuspended()) {
                oBinding.resume();
              }
            });
          };

          fnTryStart();
        },

        _scheduleReloadAfterBindingChange: function (iPage) {
          const oTable = this._table;
          const oBinding = oTable && oTable.getBinding("rows");
          if (!oBinding) {
            this._requestedPage = iPage;
            this._pagingStarted = false;
            this._startPagingWhenBound(oTable);
            return;
          }

          oBinding.attachEventOnce("dataReceived", () => {
            if (this._ignoreNextDataReceived) {
              this._ignoreNextDataReceived = false;
              return;
            }
            this._captureBindingState(oBinding);
            this._loadServerPage(iPage || 1);
          });
        },

        _captureBindingState: function (oBinding) {
          if (!oBinding) {
            return;
          }

          if (typeof oBinding.getFilters === "function") {
            const vFilters = oBinding.getFilters(FilterType.Application);
            this._userFilters = vFilters;
          } else if (Array.isArray(oBinding.aApplicationFilters)) {
            this._userFilters = oBinding.aApplicationFilters.slice();
          }

          if (Array.isArray(oBinding.aSorters) && oBinding.aSorters.length) {
            this._userSorters = oBinding.aSorters.slice();
          } else {
            this._userSorters = [];
          }
        },

        _rebuildPaginationButtons: function () {
          const oToolbar = this._paginationToolbar;
          const oPagination = this._getPaginationModel();
          if (!oToolbar || !oPagination) {
            return;
          }

          oToolbar.destroyContent();
          oToolbar.addContent(new ToolbarSpacer());

          oToolbar.addContent(
            new Button({
              text: "{i18n>paginationPrevious}",
              enabled: "{pagination>/prevEnabled}",
              press: this.onPaginationPrevious.bind(this)
            })
          );

          const iCurrent = oPagination.getProperty("/currentPage") || 1;
          const iTotal = oPagination.getProperty("/totalPages") || 1;
          this._visiblePageNumbers(iCurrent, iTotal).forEach((iPage) => {
            const oPageButton = new Button({
              text: String(iPage),
              type: iPage === iCurrent ? "Emphasized" : "Transparent",
              press: this.onPaginationPage.bind(this)
            });
            oPageButton.data("page", iPage);
            oToolbar.addContent(oPageButton);
          });

          oToolbar.addContent(
            new Button({
              text: "{i18n>paginationNext}",
              enabled: "{pagination>/nextEnabled}",
              press: this.onPaginationNext.bind(this)
            })
          );
        },

        _visiblePageNumbers: function (iCurrent, iTotal) {
          const iMaxButtons = 7;
          if (iTotal <= iMaxButtons) {
            return Array.from({ length: iTotal }, (_, i) => i + 1);
          }

          let iStart = Math.max(1, iCurrent - Math.floor(iMaxButtons / 2));
          let iEnd = iStart + iMaxButtons - 1;
          if (iEnd > iTotal) {
            iEnd = iTotal;
            iStart = Math.max(1, iTotal - iMaxButtons + 1);
          }
          return Array.from({ length: iEnd - iStart + 1 }, (_, i) => iStart + i);
        },

        _goToPage: function (iPage) {
          const oPagination = this._getPaginationModel();
          const iTotalPages = (oPagination && oPagination.getProperty("/totalPages")) || 1;
          const iTarget = Math.min(Math.max(1, iPage), iTotalPages);
          return this._loadServerPage(iTarget);
        },

        /**
         * Public OData V4 API: requestContexts(skip, top) issues $skip/$top.
         * Then the GridTable rows binding is filtered to only that page's keys
         * so the table contains exactly the page window (15 or 2 rows).
         */
        _loadServerPage: async function (iPage) {
          const oModel = this.base.getView().getModel();
          if (!oModel) {
            return;
          }

          const aSorters = this._userSorters || [];
          let aFilters = [];
          if (this._userFilters) {
            aFilters = Array.isArray(this._userFilters)
              ? this._userFilters
              : [this._userFilters];
          }

          const oListBinding = oModel.bindList("/Spacefarers", undefined, aSorters, aFilters, {
            $count: true
          });

          try {
            const iSkip = (Math.max(1, iPage) - 1) * PAGE_SIZE;
            const aContexts = await oListBinding.requestContexts(iSkip, PAGE_SIZE);
            let iCount = typeof oListBinding.getCount === "function" ? oListBinding.getCount() : -1;
            if (iCount == null || iCount < 0) {
              iCount = iSkip + aContexts.length;
            }

            const iTotalPages = Math.max(1, Math.ceil(iCount / PAGE_SIZE) || 1);
            const iTarget = Math.min(Math.max(1, iPage), iTotalPages);
            if (iTarget !== iPage && iCount > 0) {
              this._safeDestroyBinding(oListBinding);
              return this._loadServerPage(iTarget);
            }

            this._pageIds = aContexts.map((oContext) => oContext.getProperty("ID"));
            this._totalCount = iCount;
            this._currentPage = iTarget;
            this._syncPaginationModel();
            this._applyPageFilterToBinding();

            if (this._table) {
              this._table.setVisibleRowCountMode("Fixed");
              this._table.setVisibleRowCount(Math.max(this._pageIds.length, 1));
            }
          } finally {
            this._safeDestroyBinding(oListBinding);
          }
        },

        _safeDestroyBinding: function (oListBinding) {
          if (!oListBinding || oListBinding.bIsDestroyed) {
            return;
          }
          try {
            oListBinding.destroy();
          } catch (oError) {
            // Temporary paging binding may already be cleaned up by the model
          }
        },

        /**
         * Shows "Spacefarers (15 of 17)" / "Spacefarers (2 of 17)" using the
         * current page size and the total matching count from pagination.
         */
        _updateTableTitleCount: function () {
          const iVisible = (this._pageIds && this._pageIds.length) || 0;
          const iTotal = this._totalCount || 0;
          const sHeader = "Spacefarers (" + iVisible + " of " + iTotal + ")";

          const oMdcTable = this._findControl(
            (oControl) =>
              oControl.isA("sap.ui.mdc.Table") &&
              String(oControl.getId()).endsWith("::LineItem")
          );
          if (oMdcTable && typeof oMdcTable.setShowRowCount === "function") {
            oMdcTable.setShowRowCount(false);
          }

          const oTitle = this._findControl(
            (oControl) =>
              oControl.isA("sap.m.Title") &&
              String(oControl.getId()).endsWith("LineItem-title")
          );
          if (oTitle && typeof oTitle.setText === "function") {
            oTitle.setText(sHeader);
          }

          const oTableTitle = this._findControl(
            (oControl) =>
              oControl.isA("sap.m.table.Title") &&
              String(oControl.getId()).endsWith("LineItem-tableTitle")
          );
          if (oTableTitle) {
            if (typeof oTableTitle.setTotalCount === "function") {
              oTableTitle.setTotalCount(0);
            }
            if (typeof oTableTitle.setSelectedCount === "function") {
              oTableTitle.setSelectedCount(0);
            }
          }
        },

        _createPageIdFilter: function () {
          const aIds = this._pageIds || [];
          if (!aIds.length) {
            return Filter.NONE;
          }
          return new Filter({
            filters: aIds.map(
              (sId) =>
                new Filter({
                  filters: [
                    new Filter("ID", FilterOperator.EQ, sId),
                    new Filter("IsActiveEntity", FilterOperator.EQ, true)
                  ],
                  and: true
                })
            ),
            and: false
          });
        },

        _applyPageFilterToBinding: function () {
          const oTable = this._table;
          const oBinding = oTable && oTable.getBinding("rows");
          if (!oBinding || typeof oBinding.filter !== "function") {
            return;
          }

          const aParts = [];
          if (this._userFilters) {
            if (Array.isArray(this._userFilters)) {
              aParts.push.apply(aParts, this._userFilters);
            } else {
              aParts.push(this._userFilters);
            }
          }
          aParts.push(this._createPageIdFilter());

          this._ignoreNextDataReceived = true;
          oBinding.attachEventOnce("dataReceived", () => {
            this._updateTableTitleCount();
          });
          oBinding.filter(
            aParts.length === 1
              ? aParts[0]
              : new Filter({
                  filters: aParts,
                  and: true
                }),
            FilterType.Application
          );
        },

        _syncPaginationModel: function () {
          const oPagination = this._getPaginationModel();
          if (!oPagination) {
            return;
          }

          const iCount = this._totalCount || 0;
          const iTotalPages = Math.max(1, Math.ceil(iCount / PAGE_SIZE) || 1);
          const iCurrentPage = Math.min(Math.max(1, this._currentPage || 1), iTotalPages);

          oPagination.setData({
            currentPage: iCurrentPage,
            totalPages: iTotalPages,
            totalCount: iCount,
            prevEnabled: iCurrentPage > 1,
            nextEnabled: iCurrentPage < iTotalPages
          });

          this._rebuildPaginationButtons();
          this._updateTableTitleCount();
        },

        _findControl: function (fnPredicate) {
          const aControls = this.base.getView().findAggregatedObjects(true, fnPredicate);
          return aControls && aControls.length ? aControls[0] : null;
        }
      }
    );
  }
);
