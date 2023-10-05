sap.ui.define([], function () {
  "use strict";

  return {
    formatDateTimeString(sDateTime) {
      const oFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };

      if (!sDateTime) {
        return "";
      }

      return new Date(sDateTime).toLocaleString(undefined, oFormatOptions);
    },

    formatTrackedTime(nMilliseconds) {
      /* eslint-disable no-magic-numbers */
      const nMinutes = (nMilliseconds / (1000 * 60)) % 60;
      const nHours = (nMilliseconds / (1000 * 60 * 60)) % 24;

      return `${nHours < 10 ? "0" : ""}${nHours.toFixed(0)}:${
        nMinutes < 10 ? "0" : ""
      }${nMinutes.toFixed(0)}`;
      /* eslint-enable no-magic-numbers */
    },
  };
});
