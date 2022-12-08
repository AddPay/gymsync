require('dotenv').config()
const { GmsAPI } = require('../services/gmsapi')
const { Logger } = require('../services/logger')
const { AtomAPI } = require('../services/atomapi')
const logger = new Logger("Readers")

/**
 * Sync ATOM Readers table with GMS Readers table
 * 
 * @return void
 */
async function readersUp() {
    const readers = AtomAPI.getReaders()
    const data = {
        Readers: readers
    }

    // update readers on gms
    await GmsAPI.syncUp(data, 'ReaderID')
}

/**
 * Sync Readers table. Up only.
 */
async function syncReaders() {

    try {
        // Sync GMS with changes from ATOM
        logger.info("Sync Readers Up")
        await readersUp()
    } catch (error) {
        logger.error(error)
    }

    setTimeout(async () => {await syncReaders()}, process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)
}

syncReaders()