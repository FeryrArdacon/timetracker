const mysql = require("mysql2/promise");

async function getDbConnection() {
  const oConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
  });
  return oConnection;
}

async function setupMysql() {
  const oConnection = await getDbConnection();

  // Create table for time tracking
  const result = await oConnection.query(`create table if not exists timespan (
    id int auto_increment,
    start datetime not null,
    end datetime null,
    time int null,
    description varchar(255) null,
    status varchar(1) not null,
    primary key (id)
  );`);

  // Check if creation had errors, but not if table already exists
  if (result[0].warningCount > 0 && result[0].code !== "ER_TABLE_EXISTS_ERROR")
    throw new Error(result[0].message);

  oConnection.end();
}

function covertDateISOToMysql(sDate) {
  return sDate.replace("T", " ").replace("Z", "");
}

function getTimezoneOffset() {
  return new Date().getTimezoneOffset() * -1 * 60 * 1000;
}

function addTimezone(oDate) {
  return new Date(oDate.getTime() + getTimezoneOffset());
}

function setApi(oApp) {
  setupMysql();

  oApp.get("/api/readTrackedTimes", async (_, oResponse) => {
    const oConnection = await getDbConnection();

    // Read tracked times
    const [result] = await oConnection.query("select * from timespan;");
    oConnection.end();

    const content = result.map((oTimespan) => {
      oTimespan.start = addTimezone(oTimespan.start);
      oTimespan.end = oTimespan.end ? addTimezone(oTimespan.end) : null;

      return {
        ...oTimespan,
        start: oTimespan.start || "",
        end: oTimespan.end || "",
        time: oTimespan.time || 0,
      };
    });

    oResponse.json(content);
  });

  oApp.post("/api/startTracking", async (oRequest, oResponse) => {
    const oConnection = await getDbConnection();

    const sStartDate = new Date().toISOString();

    // Start tracking
    const [result] = await oConnection.query(
      "insert into timespan (start, description, status) values (?, ?, ?);",
      [covertDateISOToMysql(sStartDate), oRequest.body.description, "1"]
    );
    oConnection.end();

    oResponse.json({
      ...oRequest.body,
      id: result.insertId,
      start: sStartDate,
      status: "1",
    });
  });

  oApp.put("/api/stopTracking", async (oRequest, oResponse) => {
    const oConnection = await getDbConnection();

    // Read start datetime
    const [content] = await oConnection.query(
      "select start from timespan where id = ?;",
      [oRequest.body.id]
    );

    // Check if start datetime was found
    if (content.length === 0) {
      oConnection.end();
      oResponse.status(404).json({
        error: "Start datetime not found",
      });
      return;
    }

    // Calculate time
    const oEndDate = new Date();
    const sEndDate = oEndDate.toISOString();
    const iTime = oEndDate.getTime() - addTimezone(content[0].start).getTime();

    // Stop tracking
    await oConnection.query(
      "update timespan set end = ?, time = ?, status = ? where id = ?;",
      [covertDateISOToMysql(sEndDate), iTime, "2", oRequest.body.id]
    );
    oConnection.end();

    oResponse.json({
      ...oRequest.body,
      end: sEndDate,
      time: iTime,
      status: "2",
    });
  });

  oApp.put("/api/correctTime", async (oRequest, oResponse) => {
    const oConnection = await getDbConnection();

    const iTime =
      new Date(oRequest.body.end).getTime() -
      new Date(oRequest.body.start).getTime();

    // Start tracking
    const [result] = await oConnection.query(
      "update timespan set start = ?, end = ?, time = ?, description = ?, status = ? where id = ?;",
      [
        covertDateISOToMysql(oRequest.body.start),
        covertDateISOToMysql(oRequest.body.end),
        iTime,
        oRequest.body.description,
        "3",
        oRequest.body.id,
      ]
    );
    oConnection.end();

    oResponse.json({
      ...oRequest.body,
      status: "3",
    });
  });

  oApp.delete("/api/untrackTime", async (oRequest, oResponse) => {
    const oConnection = await getDbConnection();

    // Delete timespan
    await oConnection.query("delete from timespan where id = ?;", [
      oRequest.body.id,
    ]);
    oConnection.end();

    oResponse.json({
      ...oRequest.body,
    });
  });
}

module.exports = {
  setApi,
};
