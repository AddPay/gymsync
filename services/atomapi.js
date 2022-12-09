const axios = require('../services/http')
const config = require('../dbConfig.js')
const cnx = require('mssql/msnodesqlv8')
const ip = require('ip');
require('dotenv').config()
const { Logger } = require('../services/logger')
const logger = new Logger("ATOMAPI")

class AtomAPI {
    /**
     * Attempt to enroll the person on ATOM
     * Triggers the enrollment helper
     * 
     * @param {string} personNumber 
     * @returns {boolean}
     */
    static async enrollPerson(personNumber) {
        try {
            const response1 = await axios.post(process.env.ATOMAPI_URL + "/Enroll/" + personNumber + '/?IPAddress=' + ip.address());
            if (response1.data == "Enroll Request sent") {
                return true
            } else {
                throw response1
            }
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Update or Insert the person in ATOM DB depending on whether it exists or not
     * 
     * @param {object} person ATOM Person Object
     * 
     * @returns {boolean}
     */
     static async autoInsertUpdatePerson(person) {
        const atomPerson = await AtomAPI.getPerson(person['Person_Number']);

        if (atomPerson !== false) {
            // the user exists... update it
            person["PersonID"] = atomPerson["PersonID"]
            return await AtomAPI.updatePerson(person)
        } else {
            // the user does not exist... create it
            return await AtomAPI.insertPerson(person)
        }
    }

    /**
     * Get ATOM Person Object
     * 
     * @param {string} personNumber ATOM Person Number
     * 
     * @returns {object|boolean} The ATOM Person Object or false on not found or error
     */
    static async getPerson(personNumber) {
        try {
            const response = await axios.get(process.env.ATOMAPI_URL + "/Persons/" + personNumber);
            const person = response.data
            if (person.Person_Number === personNumber) {
                return person
            }
        } catch (error) {
            logger.error(error)
            // not sure
        }
        return false
    }

    /**
     * Update Person in ATOM DB
     * 
     * @param {object} person ATOM Person Object
     * 
     * @returns {boolean}
     */
    static async updatePerson(person) {
        try {
            const response = await axios.put(process.env.ATOMAPI_URL + "/Persons/", person)
            const data = response.data
            if (data !== '') {
                throw response
            }
            return true
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Insert Person in ATOM DB
     * 
     * @param {object} person ATOM Person Object
     * 
     * @returns {boolean}
     */
    static async insertPerson(person) {
        try {
            const response = await axios.post(process.env.ATOMAPI_URL + "/Persons/", person)
            const data = response.data
            if (data !== '') {
                throw response
            }
            return true
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Find out whether a specific atom user exists or not
     * 
     * @param {string} personNumber 
     * @returns {boolean} Where atom user exists or not
     */
    static async personExists(personNumber) {
        const person = await AtomAPI.getPerson(personNumber)
        return person ? person.Person_Number === personNumber : false
    }

    /**
     * Get transactions from ATOM DB that have not been synced with GMS
     * 
     * @returns {array|boolean} Array of Transaction objects, or false on not found or failure
     */
    static async getUnsyncedTransactions() {
        try {
            const limit = process.env.TRANSACTIONS_TABLE_LIMIT > 0 ? "TOP " + process.env.TRANSACTIONS_TABLE_LIMIT : ""
            const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
            const result = await sql.query(`SELECT ${limit} * FROM Transactions WHERE tExtProcessed <> 1`)
            return result.recordset
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Set supplied transactions as having been updated in GMS
     * 
     * @param {object} transaction  Set these transactions in ATOM DB as having been
     *                              updated in GMS
     * 
     * @returns {boolean}
     */
    static async setTransactionsSynced(transactions) {
        const TransactionIDs = AtomAPI.getColumnValuesString(transactions, 'TransactionID')

        try {
            const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
            const result1 = await sql.query(`UPDATE Transactions SET tExtProcessed = 1 WHERE TransactionID IN(${TransactionIDs})`)
            logger.info(result1)
            return true
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Get all ATOM Readers
     * 
     * @returns {array|boolean} 
     */
    static async getReaders() {
        try {
            const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
            const result = await sql.query(`select * from Readers`)
            return result.recordset
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Get Persons on ATOM not synced with GMS
     * 
     * @returns {array|boolean}
     */
    static async getUnsyncedPersons() {
        try {
            const limit = process.env.PERSONS_TABLE_LIMIT > 0 ? "TOP " + process.env.PERSONS_TABLE_LIMIT : ""
            const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
            const result = await sql.query(`SELECT ${limit} PersonID,pName,pSurname,pPersonNumber,pIDNo,DepartmentID,PersonTypeID,PersonStateID,FORMAT(pStartDate, 'yyyy-MM-dd') as pStartDate,FORMAT(pTerminationDate, 'yyyy-MM-dd') as pTerminationDate,pDesignation,pFingerTemplate1Quality,pFingerTemplate2Quality,pPresence,pPresenceSiteID,pPresenceUpdated,PayGroupID,ShiftCycleID,ShiftCycleDay,FORMAT(CycledShiftUpdate, 'yyyy-MM-dd') as CycledShiftUpdate,pTAClocker,pFONLOFF,p3rdPartyUID,pTerminalDBNumber from Persons where p3rdPartyUID <> 1`)
            return result.recordset
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * Set these Persons as having been updated on GMS
     * 
     * @param {array} persons Array of Person objects
     * 
     * @returns {boolean}
     */
    static async setPersonsSynced(persons) {
        try {
            const personIDs = AtomAPI.getColumnValuesString(persons, 'PersonID')
            // tell ATOM we have successfully updated GMS
            const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
            await sql.query(`UPDATE Persons SET p3rdPartyUID = 1 WHERE PersonID IN(${personIDs})`)
            return true
        } catch (error) {
            logger.error(error)
        }
        return false
    }

    /**
     * 
     * @param {array} data 
     * @param {string} column 
     * 
     * @returns {string} comma-separated quoted list of values from specified column
     */
    static getColumnValuesString(data, column) {
        const values = []

        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                values.push(data[i][column])
            }
        }

        return "'" + values.join("','") + "'"
    }
}

module.exports = {AtomAPI}