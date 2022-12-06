const cnx = require('mssql/msnodesqlv8')
require('dotenv').config()
const { SyncTables } = require("./synctables.class.js")
const config = require('./dbConfig.js')

/**
 * Sync Transactions table. Up only.
 * 
 * @param {Promise<ConnectionPool> & void} sync MSSQL connection
 */
async function syncTransactions(sync) {

    try {
        // Sync GMS with changes from ATOM
        await sync.TransactionsUp()
    } catch (error) {
        console.error(error)
    }
    
    setTimeout(syncTransactions(sync), process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)
}

// main

async function main() {
    try {
        // Connect to ATOM MSSQL server
        const sql = await cnx.connect(config)
        const sync = new SyncTables(sql)

        syncTransactions(sync)

    } catch (error) {
        console.error(error)
    }
}

main()