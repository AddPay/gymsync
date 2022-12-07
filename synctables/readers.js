const cnx = require('mssql/msnodesqlv8')
require('dotenv').config()
const { SyncTables } = require("./synctables.class.js")
const config = require('../dbConfig.js')
const logger = require('../services/logger')

/**
 * Sync Readers table. Up only.
 * 
 * @param {Promise<ConnectionPool> & void} sync MSSQL connection
 */
async function syncReaders(sync) {

    try {
        // Sync GMS with changes from ATOM
        await sync.ReadersUp()
    } catch (error) {
        logger.error(error)
    }

    setTimeout(syncReaders(sync), process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)
}

// main

async function main() {
    try {
        // Connect to ATOM MSSQL server
        const sql = await cnx.connect(config)

        const sync = new SyncTables(sql)

        syncReaders(sync)

    } catch (error) {
        logger.error(error)
    }
}

main()