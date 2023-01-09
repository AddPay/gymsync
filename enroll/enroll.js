const { AtomAPI } = require('../services/atomapi')
const { GmsAPI } = require('../services/gmsapi')
require('dotenv').config()
const { Logger } = require('../services/logger')
const logger = new Logger("Enroll")

let retry = 0

/**
 * Trigger the ATOM enrollment helper
 */
async function enroll() {

    // Get the PersonNumber of the user to be enrolled from GMS
    const personNumber = await GmsAPI.getEnrollmentRequest()

    if (personNumber) {

        const exists = await AtomAPI.personExists(personNumber)

        if (exists === true) {
            // trigger the ATOM enrollment helper
            logger.info("Attempt to enroll " + personNumber)
            await AtomAPI.enrollPerson(personNumber)

            logger.info("Clearing enrollment status")
            await GmsAPI.clearEnrollmentRequest()
            retry = 0
        } else {
            // give the syncing some time before clearing the status on GMS
            // in case the persons table has not been synced yet
            if (retry > process.env.MAX_RETRIES) {
                logger.info("Done retrying... clearing the enrollment status.")
                await GmsAPI.clearEnrollmentRequest()
                retry = 0
            } else {
                logger.warn("Waiting for ATOM person sync. Retry #" + retry)
                ++retry
            }
        }
    }

    setTimeout(async () => {await enroll()}, process.env.ENROLL_INTERVAL_MILLISECONDS)

}

enroll()