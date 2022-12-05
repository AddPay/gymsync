import { connect } from "mssql";
import SyncTables from "./synctables.class.js";

// main

async () => {
    try {
        const sql = await connect(process.env.MSSQL_CONNECTION_STRING)

        const sync = new SyncTables(sql)

        setInterval(async() => {
            /**
             * Sync ATOM with changes from GMS FIRST
             * GMS changes take preference over ATOM changes, because GMS changes are more frequent. 
             * Gym staff don't typically update ATOM's Persons table
             */
            await sync.PersonsDown()

            // Sync GMS with changes from ATOM
            await sync.PersonsUp()
        }, process.env.PERSONS_SYNC_INTERVAL_MILLISECONDS)

        // Sync GMS with changes from ATOM
        setInterval(sync.TransactionsUp, process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)
        setInterval(sync.ReadersUp, process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)

    } catch (err) {
        // ... error checks
    }
}