require('dotenv').config()
const { AtomAPI } = require('../services/atomapi')
const { GmsAPI } = require('../services/gmsapi')
const { Logger } = require('../services/logger')
const logger = new Logger("Persons")

/**
 * Sync Persons table on ATOM with new data from GMS
 * Currently syncs only one user at a time from GMS
 * 
 * @return void
 */
async function PersonsDown() {
    // Get a user that has been updated on GMS
    const person = await GmsAPI.getSingleEditedUser()

    if (person) {
        const result = await AtomAPI.autoInsertUpdatePerson(person);

        if (result) {
            await GmsAPI.personSyncedOnAtom(person['id'])
        }
    } else {
        logger.info("No users have been added/edited on GMS")
    }
}

/**
 * Sync suspi_users/Persons table on GMS with changes to ATOM Persons table
 * 
 * @return void
 */
async function PersonsUp() {
    const persons = await AtomAPI.getUnsyncedPersons()

    const data = {
        Persons: persons
    }

    // update persons on gms
    await GmsAPI.syncUp(data, 'PersonID')

    await AtomAPI.setPersonsSynced(persons)
}

/**
 * Sync the Persons & suspi_users tables (up and down). Down first.
 */
async function syncPersons() {

    try {
        /**
         * Sync ATOM with changes from GMS FIRST
         * GMS changes take preference over ATOM changes, because GMS changes are more frequent. 
         * Gym staff don't typically update ATOM's Persons table
         */
        logger.info("Syncing Persons Down")
        await PersonsDown()

        // Sync GMS with changes from ATOM
        logger.info("Syncing Persons Up")
        await PersonsUp()
    } catch (error) {
        logger.error(error)
    }

    setTimeout(async () => {await syncPersons()}, process.env.PERSONS_SYNC_INTERVAL_MILLISECONDS)
}

syncPersons()