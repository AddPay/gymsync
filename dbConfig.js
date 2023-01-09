// https://stackoverflow.com/a/68244028/5860942
// https://medium.com/@kunalbhattacharya/nodejs-integration-with-sql-server-using-windows-authentication-20493b16a89d
require('dotenv').config()

var dbConfig = {
    server: process.env.MSSQL_SERVER,
    port: process.env.MSSQL_PORT,
    database: process.env.MSSQL_DATABASE,
    driver: "msnodesqlv8",
    options: {
      trustedConnection: true
    }
  }
  module.exports = dbConfig