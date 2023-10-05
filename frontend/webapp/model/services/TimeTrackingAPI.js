sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
  "use strict";

  return ManagedObject.extend("timetracker.model.services.TimeTrackingAPI", {
    readTrackedTimes() {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/api/readTrackedTimes",
          method: "GET",
          headers: {
            "x-http-method-override": "GET",
            accept: "application/json",
          },
          success: (oData) => {
            resolve(oData);
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },

    startTracking(oTimespan) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/api/startTracking",
          method: "POST",
          data: JSON.stringify(oTimespan),
          headers: {
            "x-http-method-override": "POST",
            "content-type": "application/json",
            accept: "application/json",
          },
          success: (oData) => {
            resolve(oData);
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },

    stopTracking(oTimespan) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `/api/stopTracking`,
          method: "PUT",
          data: JSON.stringify(oTimespan),
          headers: {
            "x-http-method-override": "PUT",
            "content-type": "application/json",
            accept: "application/json",
          },
          success: (oData) => {
            resolve(oData);
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },

    correctTime(oTimespan) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `/api/correctTime`,
          method: "PUT",
          data: JSON.stringify(oTimespan),
          headers: {
            "x-http-method-override": "PUT",
            "content-type": "application/json",
            accept: "application/json",
          },
          success: (oData) => {
            resolve(oData);
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },

    untrackTime(iId) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `/api/untrackTime`,
          method: "DELETE",
          data: JSON.stringify({ id: iId }),
          headers: {
            "x-http-method-override": "DELETE",
            "content-type": "application/json",
            accept: "application/json",
          },
          success: (oData) => {
            resolve(oData);
          },
          error: (oError) => {
            reject(oError);
          },
        });
      });
    },
  });
});
