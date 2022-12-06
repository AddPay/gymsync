const axios = require('axios').default;
require('dotenv').config()

/**
 * Trigger the ATOM enrollment helper
 */
async function enroll() {
    // Get the PersonNumber of the user to be enrolled from GMS
    const response = await axios.get(process.env.GMSAPI_URL + "/atom.php?action=getstatus");

    const data = response.data

    let personNumber

    if (typeof data == "string") {
        const statusString = data.replaceAll("\n", "")
        const status = statusString.split(",")
        if (status.length == 3) {
            if (status[1] !== '0') {
                personNumber = status[1]
            }
        }
    }

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