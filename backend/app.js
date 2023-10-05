const express = require("express");
const helmet = require("helmet");
const compression = require("http-compression");
const oBodyParser = require("body-parser");

const oApi = require("./api");

require("dotenv").config();

const oApp = express();
const iPort = process.env.PORT;

oApp.use(helmet());
oApp.use(compression({ level: 2 }));
oApp.use(oBodyParser.json());

console.log(process.env.STATIC_APP_SOURCE);
// Frontend sources
oApp.use("/app", express.static(process.env.STATIC_APP_SOURCE));

// API
oApi.setApi(oApp);

// Start server
oApp.listen(iPort, () => {
  console.log(`Server listening on port ${iPort}`);
});
