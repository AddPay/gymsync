require('dotenv').config()
const { GmsAPI } = require('../services/gmsapi')
const { Logger } = require('../services/logger')
const { AtomAPI } = require('../services/atomapi.js')
const logger = new Logger("Transactions")

/**
 * Sync GMS Transactions table with data from the ATOM Transactions table
 * 
 * @return void
 */
async function TransactionsUp() {
    const transactions = await AtomAPI.getUnsyncedTransactions()

    const data = {
        Transactions: transactions
    }

    // update transactions on gms
    await GmsAPI.syncUp(data, 'TransactionID')

    await AtomAPI.setTransactionsSynced(transactions)
}

/**
 * Sync Transactions table. Up only.
 */
async function syncTransactions() {

    try {
        // Sync GMS with changes from ATOM
        logger.info("Syncing Transactions Up")
        await TransactionsUp()
    } catch (error) {
        logger.error(error)
    }
    
    setTimeout(async () => {await syncTransactions(sync)}, process.env.DEFAULT_SYNC_INTERVAL_MILLISECONDS)
}

syncTransactions()