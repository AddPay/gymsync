const axios = require('../services/http')
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
            if (person.Person_Number == personNumber) {
                return person
            }
        } catch (error) {
            logger.error(error)
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
        return person ? true : false
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
            const result = await sql.query(`SELECT ${limit} [TransactionID]
                ,[tDateTime]
                ,[PersonID]
                ,[ReaderID]
                ,[tDirection]
                ,[tReaderDescription]
                ,[tManual]
                ,[tDeleted]
                ,[tTAProcessed]
                ,[TimesheetDayID]
                ,[tExtProcessed]
                ,[tLogical]
                ,[tTemperature]
                ,[tAbnormalTemp] FROM Transactions WHERE tExtProcessed <> 1`)
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
    static async setTransactionsSynced(transactions, synced = true) {
        const TransactionIDs = AtomAPI.getColumnValuesString(transactions, 'TransactionID')

        try {
            if (TransactionIDs != "''") {
                const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
                const tExtProcessed = synced ? 1 : 0
                await sql.query(`UPDATE Transactions SET tExtProcessed = ${tExtProcessed} WHERE TransactionID IN(${TransactionIDs})`)
            }
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
            const result = await sql.query(`select [ReaderID]
                ,[rDescription]
                ,[rIPAddress]
                ,[ReaderBrandID]
                ,[rType]
                ,[rFirmwareVersion]
                ,[rNumUsers]
                ,[rNumDBs]
                ,[rFunction]
                ,[ReaderFunctionID]
                ,[SiteID]
                ,[rRelayEnabled]
                ,[rRelayTime]
                ,[rTimeMaskEnabled]
                ,[rEnrolment]
                ,[rEmergency]
                ,[rPresence]
                ,[rLastOnlineDateTime]
                ,[rEmergencyState]
                ,[rTPFixedAddress]
                ,[rTPLogicalAddress]
                ,[rSerialNumber]
                ,[rVerificationID] from Readers`)
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
    static async setPersonsSynced(persons, synced = true) {
        try {
            const personIDs = AtomAPI.getColumnValuesString(persons, 'PersonID')
            if (personIDs !== "''") {
                // tell ATOM we have successfully updated GMS
                const p3rdPartyUID = synced ? 1 : 0
                const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
                await sql.query(`UPDATE Persons SET p3rdPartyUID = ${p3rdPartyUID} WHERE PersonID IN(${personIDs})`)
            }
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