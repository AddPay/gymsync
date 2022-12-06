// https://stackoverflow.com/a/68244028/5860942
// https://medium.com/@kunalbhattacharya/nodejs-integration-with-sql-server-using-windows-authentication-20493b16a89d
var dbConfig = {
    server: 'RICHARDS-PC',
    port: 1433,
    database: 'ATOM',
    driver: "msnodesqlv8",
    options: {
      trustedConnection: true
    }
  }
  module.exports = dbConfig