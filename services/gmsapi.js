const axios = require('../services/http')
require('dotenv').config()
const qs = require('qs');
const { Logger } = require('../services/logger')
const logger = new Logger("ATOMAPI")

class GmsAPI {
    /**
     * Get any enrollment requests from GMS
     * 
     * @returns {string|boolean} ATOM Person_Number to enroll. False on none or error
     */
    static async getEnrollmentRequest() {
        try {
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
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Clear the enrollment request on GMS
     * 
     * @returns {boolean}
     */
    static async clearEnrollmentRequest() {
        try {
            await axios.get(process.env.GMSAPI_URL + "/atom.php?action=clearstatus");
            return true // improve error handling here
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Notify GMS that person has been synced on ATOM
     * 
     * @param {string} gmsUserId GMS User ID
     * @returns {boolean}
     */
    static async personSyncedOnAtom(gmsUserId) {
        try {
            // this returns an empty string regardless whether the user exists or not
            // I will need to improve this on GMS API
            await axios.get(process.env.GMSAPI_URL + "/atom.php?action=updateusers&actiontype=" + gmsUserId);
            return true
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Helper function to post the data to GMS
     * 
     * @param {object} data 
     * @param {string} idColumn 
     */
    static async syncUp(data, idColumn) {
        try {
            const params = qs.stringify({
                da: data,
                wc: idColumn,
                sa: 'up',
            })

            // the script responds with ok - even if the column is incorrect
            // need to fix that on GMS API at some point
            await axios.post(process.env.GMSAPI_URL + "/gymsync.php", params);
            return true
        } catch (error) {
            logger.error(error) 
        }
        return false
    }

    /**
     * Get an edited user from GMS (the only syncing down we do)
     * 
     * @returns {object|boolean} A updated person on GMS or false if there are none or error
     */
    static async getSingleEditedUser() {
        try {
            const response = await axios.get(process.env.GMSAPI_URL + "/atom.php?action=geteditusers");
            const people = response.data

            let person

            if (Array.isArray(people)) {
                if (people.length > 0) {
                    if (typeof people[0]['Person_Number'] != "undefined") {
                        if (typeof people[0]['Access_Group_List'] == "string") {
                            try {
                                people[0]['Access_Group_List'] = JSON.parse(people[0]['Access_Group_List'])
                            } catch (error) { }
                        }
                        person = people[0]
                    } else {
                        throw "Person_Number not found in response data."
                    } 
                }
            } else if (people === null) {
                logger.info("No edited users on GMS")
            } else {
                // something was wrong with the response
                throw response
            }

            return person ? person : false
        } catch (error) {
            logger.error(error) 
        }
        return false
    }
    
}

module.exports = {GmsAPI}