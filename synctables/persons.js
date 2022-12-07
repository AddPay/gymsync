const cnx = require('mssql/msnodesqlv8')
require('dotenv').config()
const { SyncTables } = require("./synctables.class.js")
const config = require('../dbConfig.js')
const logger = require('../services/logger')

/**
 * Sync the Persons & suspi_users tables (up and down). Down first.
 * 
 * @param {Promise<ConnectionPool> & void} sync MSSQL connection
 */
async function syncPersons(sync) {

    try {
        /**
         * Sync ATOM with changes from GMS FIRST
         * GMS changes take preference over ATOM changes, because GMS changes are more frequent. 
         * Gym staff don't typically update ATOM's Persons table
         */
        logger.info("Syncing Persons Down")
        await sync.PersonsDown()

        // Sync GMS with changes from ATOM
        logger.info("Syncing Persons Up")
        await sync.PersonsUp()
    } catch (error) {
        logger.error(error)
    }

    setTimeout(syncPersons(sync), process.env.PERSONS_SYNC_INTERVAL_MILLISECONDS)
}

// main

async function main() {
    try {
        // Connect to ATOM MSSQL server
        const sql = await cnx.connect(config)

        const sync = new SyncTables(sql)

        syncPersons(sync)

    } catch (error) {
        logger.error(error)
    }
}

main()