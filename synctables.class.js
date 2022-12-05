import { post, get, put } from 'axios';

/**
 * Sync data between ATOM and GMS
 */
class SyncTables {

    /**
     * @property {ConnectionPool} sql - The MSSQL connection pool object
     */
    sql

    /**
     * 
     * @param {ConnectionPool} sql 
     */
    constructor(sql) {
        this.sql = sql
    }

    /**
     * 
     * @param {object} data 
     * @param {string} idColumn 
     */
    async syncUp(data, idColumn) {
        const body = {
            da: data,
            wc: idColumn,
        }
        await post(process.env.GMSAPI_URL + "/gymsync.php", body);
    }

    async PersonsDown() {
        // Get a user that has been updated on GMS
        const response = await get(process.env.GMSAPI_URL + "/atom.php?action=geteditusers");
        console.log('Api response', response.data);

        const suspiUser = response.data

        const personNumber = suspiUser.personNumber

        const personJson = await get(process.env.ATOMAPI_URL + "/Person/", personNumber);

        if (personJson) {
            // the user exists... update it
            await put(process.env.ATOMAPI_URL + "/Persons/", suspiUser)
        } else {
            // the user does not exist... create it
            await post(process.env.ATOMAPI_URL + "/Persons/", suspiUser)
        }

        // tell GMS that we have updated this user on ATOM
        const body = {
            action: 'updateusers',
            actiontype: suspiUser.id
        }
        await post(process.env.GMSAPI_URL + "/atom.php", body);  
    }

    async PersonsUp() {
        // Get persons updated on ATOM
        const persons = await sql.query(`SELECT TOP 200 PersonID,pName,pSurname,pPersonNumber,pIDNo,DepartmentID,PersonTypeID,PersonStateID,FORMAT(pStartDate, 'yyyy-MM-dd') as pStartDate,FORMAT(pTerminationDate, 'yyyy-MM-dd') as pTerminationDate,pDesignation,pFingerTemplate1Quality,pFingerTemplate2Quality,pPresence,pPresenceSiteID,pPresenceUpdated,PayGroupID,ShiftCycleID,ShiftCycleDay,FORMAT(CycledShiftUpdate, 'yyyy-MM-dd') as CycledShiftUpdate,pTAClocker,pFONLOFF,p3rdPartyUID,pTerminalDBNumber from Persons where p3rdPartyUID <> 1`)

        // update persons on gms
        await syncUp(persons, 'PersonID')

        // tell ATOM we have successfully updated GMS
        await sql.query(`UPDATE Persons SET p3rdPartyUID = 1 WHERE PersonID IN()`)
    }

    async TransactionsUp() {
        const transactions = await sql.query(`SELECT TOP 300 * FROM Transactions WHERE tExtProcessed <> 1`)
        // update transactions on gms
        await syncUp(transactions, 'TransactionID')

        // set tExtProcessed to 1 on atom
        await sql.query(`UPDATE Transactions SET tExtProcessed = 1 WHERE TransactionID IN()`)
    }

    async ReadersUp() {
        const readers = await sql.query(`select * from Readers`)
        // update readers on gms
        await syncUp(readers, 'ReaderID')
    }
}

export default SyncTables