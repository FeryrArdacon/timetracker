sap.ui.define(
  [
    "timetracker/controller/abstract/BaseController",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("timetracker.controller.Main", {
      onInit() {
        this._initModels();
        this.getRouter()
          .getRoute("main")
          .attachPatternMatched(this._onPatternMatched, this);
      },

      _initModels() {
        this.getView().setModel(new JSONModel({}), "MainVM");
      },

      async _onPatternMatched() {
        this.getView().getModel("AppVM").setProperty("/busy", true);
        await this._getTrackedTimes();
        this.getView().getModel("AppVM").setProperty("/busy", false);
      },

      async _getTrackedTimes() {
        const aTimespans = await this.getTrackingService().readTrackedTimes();
        this.getModel("TrackedTimes").setProperty("/timesspans", aTimespans);
      },

      onAddTimeSpan() {
        this.setModel(
          new JSONModel(this._createNewTimeSpan()),
          "NewTimespanDialogVM"
        );
        this.openDialog("NewTimespan");
      },

      _createNewTimeSpan() {
        return {
          id: "",
          start: "",
          end: "",
          time: 0,
          description: "",
          status: "0",
        };
      },

      /**
       * @ui5ignore used in dialog NewTimespan
       */
      onCancelNewTimespanDialog() {
        this.closeDialog("NewTimespan");
      },

      /**
       * @ui5ignore used in dialog NewTimespan
       */
      onAcceptNewTimespanDialog() {
        this.closeDialog("NewTimespan");
        const oNewTimespan = this.getModel("NewTimespanDialogVM").getData();
        const aTimespans =
          this.getModel("TrackedTimes").getProperty("/timesspans");
        this.getModel("TrackedTimes").setProperty("/timesspans", [
          ...aTimespans,
          oNewTimespan,
        ]);
        this.setModel(undefined, "NewTimespanDialogVM");
      },

      onStartTracking(oEvent) {
        this.getModel("AppVM").setProperty("/busy", true);
        const sBindingPath = oEvent
          .getSource()
          .getBindingContext("TrackedTimes")
          .getPath();
        const oModel = this.getModel("TrackedTimes");

        const oTimespan = oModel.getProperty(sBindingPath);

        this.getTrackingService()
          .startTracking(oTimespan)
          .then((oResponseData) => {
            oModel.setProperty(sBindingPath, oResponseData);
          })
          .finally(() => {
            this.getModel("AppVM").setProperty("/busy", false);
          });
      },

      onStopTracking(oEvent) {
        this.getModel("AppVM").setProperty("/busy", true);
        const sBindingPath = oEvent
          .getSource()
          .getBindingContext("TrackedTimes")
          .getPath();
        const oModel = this.getModel("TrackedTimes");

        const oTimespan = oModel.getProperty(sBindingPath);

        this.getTrackingService()
          .stopTracking(oTimespan)
          .then((oResponseData) => {
            oModel.setProperty(sBindingPath, oResponseData);
          })
          .finally(() => {
            this.getModel("AppVM").setProperty("/busy", false);
          });
      },

      onEditTimeSpan() {
        const sBindingPath = this.byId("timesspanstable")
          .getSelectedItem()
          .getBindingContext("TrackedTimes")
          .getPath();
        const oModel = this.getModel("TrackedTimes");

        const oTimespan = structuredClone(oModel.getProperty(sBindingPath));
        oTimespan.start = new Date(oTimespan.start);
        oTimespan.end = new Date(oTimespan.end);
        this.setModel(new JSONModel(oTimespan), "EditTimespanDialogVM");
        this.openDialog("EditTimespan");
      },

      /**
       * @ui5ignore used in dialog EditTimespan
       */
      onCancelEditTimespanDialog() {
        this.closeDialog("EditTimespan");
        this.setModel(undefined, "EditTimespanDialogVM");
      },

      /**
       * @ui5ignore used in dialog EditTimespan
       */
      async onAcceptEditTimespanDialog() {
        this.closeDialog("EditTimespan");
        this.getModel("AppVM").setProperty("/busy", true);
        const oEditedTimespan = this.getModel("EditTimespanDialogVM").getData();

        oEditedTimespan.start = oEditedTimespan.start.toISOString();
        oEditedTimespan.end = oEditedTimespan.end.toISOString();

        await this.getTrackingService().correctTime(oEditedTimespan);
        await this._getTrackedTimes();

        this.setModel(undefined, "EditTimespanDialogVM");
        this.getModel("AppVM").setProperty("/busy", false);
      },

      async onDeleteTimeSpan() {
        const sBindingPath = this.byId("timesspanstable")
          .getSelectedItem()
          .getBindingContext("TrackedTimes")
          .getPath();
        const oModel = this.getModel("TrackedTimes");

        const { id: iId } = oModel.getProperty(sBindingPath);
        this.getModel("AppVM").setProperty("/busy", true);
        try {
          await this.getTrackingService().untrackTime(iId);
          await this._getTrackedTimes();
        } catch (oError) {
          console.error(oError);
        } finally {
          this.getModel("AppVM").setProperty("/busy", false);
        }
      },
    });
  }
);
