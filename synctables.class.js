const axios = require('axios').default;

/**
 * Sync data between ATOM and GMS
 */
class SyncTables {

    /**
     * @property {ConnectionPool} sql - The MSSQL connection pool object
     */
    sql

    /**
     * @param {ConnectionPool} sql 
     */
    constructor(sql) {
        this.sql = sql
    }

    /**
     * Sync Persons table on ATOM with new data from GMS
     * Currently syncs only one user at a time from GMS
     * 
     * @return void
     */
    async PersonsDown() {
        // Get a user that has been updated on GMS
        try {
            const person = await this.getSingleEditedUser()

            if (person) {
                const personExists = await this.atomPersonExists(person['Person_Number']);

                if (personExists) {
                    // the user exists... update it
                    await axios.put(process.env.ATOMAPI_URL + "/Persons/", person)
                } else {
                    // the user does not exist... create it
                    await axios.post(process.env.ATOMAPI_URL + "/Persons/", person)
                }

                // tell GMS that we have updated this user on ATOM
                const body = {
                    action: 'updateusers',
                    actiontype: person['id']
                }
                await axios.post(process.env.GMSAPI_URL + "/atom.php", body);  
            } else {
                console.log("No users have been added/edited on GMS")
            }
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Sync suspi_users/Persons table on GMS with changes to ATOM Persons table
     * 
     * @return void
     */
    async PersonsUp() {
        const limit = process.env.PERSONS_TABLE_LIMIT > 0 ? "TOP " + process.env.PERSONS_TABLE_LIMIT : ""

        const result = await this.sql.query(`SELECT ${limit} PersonID,pName,pSurname,pPersonNumber,pIDNo,DepartmentID,PersonTypeID,PersonStateID,FORMAT(pStartDate, 'yyyy-MM-dd') as pStartDate,FORMAT(pTerminationDate, 'yyyy-MM-dd') as pTerminationDate,pDesignation,pFingerTemplate1Quality,pFingerTemplate2Quality,pPresence,pPresenceSiteID,pPresenceUpdated,PayGroupID,ShiftCycleID,ShiftCycleDay,FORMAT(CycledShiftUpdate, 'yyyy-MM-dd') as CycledShiftUpdate,pTAClocker,pFONLOFF,p3rdPartyUID,pTerminalDBNumber from Persons where p3rdPartyUID <> 1`)
        const persons = {
            Persons: result.recordset
        }

        // update persons on gms
        await this.syncUp(persons, 'PersonID')

        const personIDs = this.getColumnValuesString(result.recordset, 'PersonID')

        // tell ATOM we have successfully updated GMS
        await this.sql.query(`UPDATE Persons SET p3rdPartyUID = 1 WHERE PersonID IN(${personIDs})`)
    }

    /**
     * Sync ATOM Transactions table with GMS Transactions table
     * 
     * @return void
     */
    async TransactionsUp() {
        const limit = process.env.TRANSACTIONS_TABLE_LIMIT > 0 ? "TOP " + process.env.TRANSACTIONS_TABLE_LIMIT : ""

        const result = await this.sql.query(`SELECT ${limit} * FROM Transactions WHERE tExtProcessed <> 1`)
        const transactions = {
            Transactions: result.recordset
        }

        // update transactions on gms
        await this.syncUp(transactions, 'TransactionID')

        const TransactionIDs = this.getColumnValuesString(result.recordset, 'TransactionID')

        try {
            // set tExtProcessed to 1 on atom - not working
            const result1 = await this.sql.query(`UPDATE Transactions SET tExtProcessed = 1 WHERE TransactionID IN(${TransactionIDs})`)
            console.log(result1)
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Sync ATOM Readers table with GMS Readers table
     * 
     * @return void
     */
    async ReadersUp() {
        const result = await this.sql.query(`select * from Readers`)
        const readers = {
            Readers: result.recordset
        }

        // update readers on gms
        await this.syncUp(readers, 'ReaderID')
    }
    
    // ----------- HELPERS ---------------- //

    /**
     * Helper function to post the data to GMS
     * 
     * @param {object} data 
     * @param {string} idColumn 
     */
     async syncUp(data, idColumn) {
        const body = {
            da: data,
            wc: idColumn,
            sa: 'up',
        }
        await axios.post(process.env.GMSAPI_URL + "/gymsync.php", body);
    }

    /**
     * Get an edited user from GMS
     * 
     * @returns {object|null} A updated person on GMS or null if there are none
     */
    async getSingleEditedUser() {
        const response = await axios.get(process.env.GMSAPI_URL + "/atom.php?action=geteditusers");

        const people = response.data

        let person

        if (Array.isArray(people)) {
            if (people.length > 0) {
                if (typeof people[0]['Person_Number'] != "undefined") {
                    person = people[0]
                } else {
                    throw "Person_Number not found in response data."
                } 
            }
        }

        return person
    }

    /**
     * FInd out whether a specific atom user exists or not
     * 
     * @param {string} personNumber 
     * @returns {boolean} Where atom user exists or not
     */
    async atomPersonExists(personNumber) {
        const response = await axios.get(process.env.ATOMAPI_URL + "/Person/", personNumber);

        try {
            const personJson = response.data
            const person = JSON.parse(personJson)
            return person.Person_Number === personNumber
        } catch (error) {
            // not sure
        }
        return false
    }

    /**
     * 
     * @param {array} data 
     * @param {string} column 
     * @returns {string} comma-separated quoted list of values from specified column
     */
    getColumnValuesString(data, column) {
        const values = []

        for (let i = 0; i < data.length; i++) {
            values.push(data[i][column])
        }

        return "'" + values.join("','") + "'"
    }
}

module.exports = { SyncTables }