import { get, post } from 'axios';

/**
 * Trigger the ATOM enrollment helper
 */
async function enroll() {
    // Get the PersonNumber of the user to be enrolled from GMS
    const response = await get(process.env.GMSAPI_URL + "/atom.php?action=getstatus");

    const pPersonNumber = response.data

    if (pPersonNumber !== '0') {
        try {
            // trigger the ATOM enrollment helper
            const response2 = await post(process.env.ATOMAPI_URL + "/Enroll/" + pPersonNumber + '/?IPAddress=' + process.env.SERVER_PC_IP);
        } catch (error) {
            console.error(error)
        }
        
        // Get the person as enrolled (or at least attempted)
        const response3 = await get(process.env.GMSAPI_URL + "/atom.php?action=clearstatus");
    }

    setTimeout(enroll, process.env.ENROLL_INTERVAL_MILLISECONDS)

}

enroll()