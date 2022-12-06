const axios = require('axios').default;
const { Enroll } = require("./enroll.class.js")
require('dotenv').config()

/**
 * Trigger the ATOM enrollment helper
 */
async function enroll() {

    const enrollObj = new Enroll()
    // Get the PersonNumber of the user to be enrolled from GMS
    const personNumber = await enrollObj.getEnrollRequest()

    if (personNumber) {
        try {
            // trigger the ATOM enrollment helper
            const response2 = await axios.post(process.env.ATOMAPI_URL + "/Enroll/" + personNumber + '/?IPAddress=' + process.env.SERVER_PC_IP);
        } catch (error) {
            console.error(error)
        }
        
        // Get the person as enrolled (or at least attempted)
        const response3 = await axios.post(process.env.GMSAPI_URL + "/atom.php?action=clearstatus");
    }

    setTimeout(enroll, process.env.ENROLL_INTERVAL_MILLISECONDS)

}

enroll()