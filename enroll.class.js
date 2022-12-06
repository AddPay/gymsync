const axios = require('axios').default;
require('dotenv').config()

class Enroll {
    async getEnrollRequest() {
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
    
        return personNumber
    }
}

module.exports = { Enroll };