sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "timetracker/model/formatter",
    "sap/ui/core/Fragment",
    "timetracker/model/services/TimeTrackingAPI",
  ],
  function (Controller, formatter, Fragment, TimeTrackingAPI) {
    "use strict";

    return Controller.extend("timetracker.controller.abstract.BaseController", {
      formatter,

      /**
       * Initialize the controller
       * @override
       */
      onInit() {},

      //*** Basics ********************************************************************

      /**
       * Get the model by name
       *
       * @param {string} sName the model name
       * @param {boolean} [bGlobal] if true, the model is searched in the component
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel(sName, bGlobal) {
        return bGlobal
          ? this.getOwnerComponent().getModel(sName)
          : this.getView().getModel(sName) ||
              this.getOwnerComponent().getModel(sName);
      },

      /**
       * Set the model to the view or component by name
       *
       * @param {sap.ui.model.Model|null|undefined} oModel the model instance
       * @param {string} sName the model name
       * @param {boolean} [bGlobal] if true, the model is set to the component
       * @returns {sap.ui.base.ManagedObject} the return value of the sapui5 setModel function
       */
      setModel(oModel, sName, bGlobal) {
        return bGlobal
          ? this.getOwnerComponent().setModel(oModel, sName)
          : this.getView().setModel(oModel, sName);
      },

      /**
       * Get the resource bundle
       *
       * @returns {sap.base.i18n.ResourceBundle} the resource bundle instance
       */
      getResBundle() {
        return this.getModel("i18n", true).getResourceBundle();
      },

      /**
       * Get the router
       *
       * @returns {sap.ui.core.routing.Router} the router instance
       */
      getRouter() {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      /**
       * Navigate back in history or to the overview
       */
      navBack() {
        const oHistory = sap.ui.core.routing.History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash === undefined) {
          const oRouter = this.getRouter();
          oRouter.navTo("main", {}, {}, true);
          return;
        }

        window.history.go(-1);
      },

      /**
       * Get the event bus
       *
       * @returns {sap.ui.core.EventBus} the event bus
       */
      getEventBus() {
        return this.getOwnerComponent().getEventBus();
      },

      //*** Dialog ********************************************************************

      /**
       * Map of loaded floatables
       *
       * @type {Map<string, sap.ui.core.Control>}
       */
      _oFloatables: new Map(),

      /**
       * Get a dialog
       *
       * @param {string} sDialogName the name of the dialog
       * @returns {Promise<sap.m.Dialog>} a promise which resolves with the dialog
       */
      async getDialog(sDialogName) {
        const oDialog = await this._getFloatable(sDialogName, "dialogs");

        if (!(oDialog instanceof sap.m.Dialog))
          throw new Error("Loaded fragment is not a dialog.");

        return oDialog;
      },

      /**
       * Get a popover
       *
       * @param {string} sPopoverName the name of the popover
       * @returns {Promise<sap.m.Popover>} a promise which resolves with the popover
       */
      async getPopover(sPopoverName) {
        const oPopover = await this._getFloatable(sPopoverName, "popovers");

        if (!(oPopover instanceof sap.m.Popover))
          throw new Error("Loaded fragment is not a popover.");

        return oPopover;
      },

      /**
       * Get a floatable
       *
       * @param {string} sFloatableName the name of the floatable
       * @param {string} sFolder the folder of the floatable
       * @returns {Promise<sap.ui.core.Control>} a promise which resolves with the floatable
       */
      async _getFloatable(sFloatableName, sFolder) {
        const oFloatable = this._oFloatables.get(sFloatableName);

        if (oFloatable) return oFloatable;

        return await this._initFloatable(sFloatableName, sFolder);
      },

      /**
       * Initialize a floatable
       *
       * @param {string} sFloatableName the name of the floatable
       * @param {string} sFolder the folder of the floatable
       * @returns {Promise<sap.ui.core.Control>} a promise which resolves with the floatable
       */
      async _initFloatable(sFloatableName, sFolder) {
        const sFragmentsFolderPath = "timetracker.view.fragments";
        const sFragmentsFile = `${sFragmentsFolderPath}.${sFolder}.${sFloatableName}`;

        const oFloatable = await Fragment.load({
          name: sFragmentsFile,
          controller: this,
        });

        if (Array.isArray(oFloatable))
          throw new Error("Loaded fragment is an array and not a floatable.");

        this._oFloatables.set(sFloatableName, oFloatable);
        return oFloatable;
      },

      /**
       * Open a dialog
       *
       * @param {string} sDialogName the name of the dialog
       * @param {Object} [mParameters] additional parameters
       * @param {sap.ui.model.Context} mParameters.oContext the new binding context for this object (SAP API)
       * @param {string} mParameters.sModelName the name of the model to set the context for or undefined (SAP API)
       * @returns {Promise<sap.m.Dialog>} a promise which resolves with the dialog
       */
      async openDialog(sDialogName, { oContext, sModelName } = {}) {
        const oDialog = await this.getDialog(sDialogName);

        if (oContext) {
          oDialog.setBindingContext(oContext, sModelName);
        }

        // dependent darf erst dann gesetzt werden,
        // wenn ein möglicher Context bereits gesetzt ist
        this.getView().addDependent(oDialog);
        oDialog.open();
        return oDialog;
      },

      /**
       * Open a popover
       *
       * @param {string} sPopoverName the name of the popover
       * @param {sap.ui.core.Control} oControl the control from which the popover should open
       * @param {Object} [mParameters] additional parameters
       * @param {sap.ui.model.Context} mParameters.oContext the new binding context for this object (SAP API)
       * @param {string} mParameters.sModelName the name of the model to set the context for or undefined (SAP API)
       * @returns {Promise<sap.m.Popover>} a promise which resolves with the popover
       */
      async openPopover(
        sPopoverName,
        oControl,
        {
          oContext,
          sModelName,
          sPlacement = sap.m.PlacementType.VerticalPreferredBottom,
        }
      ) {
        const oPopover = await this.getPopover(sPopoverName);

        if (oContext) {
          oPopover.setBindingContext(oContext, sModelName);
        }

        oPopover.setPlacement(sPlacement);

        // dependent darf erst dann gesetzt werden,
        // wenn ein möglicher Context bereits gesetzt ist
        this.getView().addDependent(oPopover);
        oPopover.openBy(oControl);
        return oPopover;
      },

      /**
       * Toggle a popover
       *
       * @param {string} sPopoverName the name of the popover
       * @param {sap.ui.core.Control} oControl the control from which the popover should open
       * @param {Object} [mParameters] additional parameters
       * @param {sap.ui.model.Context} mParameters.oContext the new binding context for this object (SAP API)
       * @param {string} mParameters.sModelName the name of the model to set the context for or undefined (SAP API)
       * @returns {Promise<sap.m.Popover>} a promise which resolves with the popover
       */
      async togglePopover(
        sPopoverName,
        oControl,
        { oContext, sModelName } = {}
      ) {
        const oPopover = await this.getPopover(sPopoverName);

        if (oPopover.isOpen()) return this.closePopover(sPopoverName);

        return this.openPopover(sPopoverName, oControl, {
          oContext,
          sModelName,
        });
      },

      /**
       * Close a dialog
       *
       * @param {string} sDialogName the name of the dialog
       * @returns {Promise<sap.m.Dialog>} a promise which resolves with the dialog
       */
      async closeDialog(sDialogName) {
        const oDialog = await this.getDialog(sDialogName);
        oDialog.close();
        return oDialog;
      },

      /**
       * Close a popover
       *
       * @param {string} sPopoverName the name of the popover
       * @returns {Promise<sap.m.Popover>} a promise which resolves with the popover
       */
      async closePopover(sPopoverName) {
        const oPopover = await this.getPopover(sPopoverName);
        oPopover.close();
        return oPopover;
      },

      /**
       *
       * @returns {timetracker.model.services.TimeTrackingAPI}
       */
      getTrackingService() {
        return new TimeTrackingAPI();
      },
    });
  }
);
