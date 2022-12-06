const cnx = require('mssql/msnodesqlv8')
require('dotenv').config()
const { SyncTables } = require("./synctables.class.js")
const config = require('./dbConfig.js')

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
        await sync.PersonsDown()

        // Sync GMS with changes from ATOM
        await sync.PersonsUp()
    } catch (error) {
        console.error(error)
    }

    setTimeout(syncPersons(sync), process.env.PERSONS_SYNC_INTERVAL_MILLISECONDS)
}

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
        console.error(error)
    }

    setTimeout(syncReaders(sync), process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)
}

// main

async function main() {
    try {
        // Connect to ATOM MSSQL server
        const sql = await cnx.connect(config)

        const sync = new SyncTables(sql)

        // Perform Syncs
        syncPersons(sync)
        syncTransactions(sync)
        syncReaders(sync)

    } catch (error) {
        console.error(error)
    }
}

main()