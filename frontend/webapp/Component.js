sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("timetracker.Component", {
      metadata: {
        manifest: "json",
      },

      init() {
        UIComponent.prototype.init.apply(this, arguments);

        this.setModel(new JSONModel({ timesspans: [] }), "TrackedTimes");

        const oRouter = this.getRouter();
        oRouter.initialize();
      },
    });
  }
);
