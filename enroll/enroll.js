const axios = require('../services/http')
const { Enroll } = require("./enroll.class.js")
const { SyncTables } = require("../synctables/synctables.class.js")
const logger = require('../services/logger')
require('dotenv').config()

let retry = 0

/**
 * Trigger the ATOM enrollment helper
 */
async function enroll() {

    const enrollObj = new Enroll()
    // Get the PersonNumber of the user to be enrolled from GMS
    const personNumber = await enrollObj.getEnrollRequest()

    if (personNumber) {

        const exists = await SyncTables.atomPersonExists(personNumber)

        if (exists === true) {
            try {
                // trigger the ATOM enrollment helper
                logger.info("Attempt to enroll " + personNumber)
                const response1 = await axios.post(process.env.ATOMAPI_URL + "/Enroll/" + personNumber + '/?IPAddress=' + process.env.SERVER_PC_IP);
                if (response1.data == "Enroll Request sent") {
                    logger.info("Clearing enrollment status")
                    const response2 = await axios.post(process.env.GMSAPI_URL + "/atom.php?action=clearstatus");
                    retry = 0
                } else {
                    throw response1
                }
            } catch (error) {
                logger.error(error)
            }
        } else {
            // give the syncing some time before clearing the status on GMS
            // in case the persons table has not been synced yet
            if (retry > process.env.MAX_RETRIES) {
                try {
                    logger.info("Done retrying... clearing the enrollment status.")
                    const response3 = await axios.post(process.env.GMSAPI_URL + "/atom.php?action=clearstatus");
                    retry = 0
                } catch (error) {
                    logger.error(error)
                }
            } else {
                logger.warn("Waiting for ATOM person sync. Retry #" + retry)
                ++retry
            }
        }
    }

    setTimeout(enroll, process.env.ENROLL_INTERVAL_MILLISECONDS)

}

enroll()