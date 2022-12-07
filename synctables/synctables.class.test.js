const { SyncTables } = require("./synctables.class.js")
const axios = require('../services/http')
require('dotenv').config()
const config = require('../dbConfig.js')
const cnx = require('mssql/msnodesqlv8')

jest.mock('axios');

let sync;

beforeAll(async () => {
    const sql = await cnx.connect(process.env.MSSQL_CONNECTION_STRING)
    sync = new SyncTables(sql)
    return sync
});

test('should get an edited user', () => {
    const user = {id: '123', Person_Number: '321'};
    const resp = {data: [user]};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return SyncTables.getSingleEditedUser().then(data => expect(data).toEqual(user));
});

test('should get column values', () => {
    const data = [{
        PersonID: 1
    },{
        PersonID: 2
    },{
        PersonID: 3
    }]

    expect(SyncTables.getColumnValuesString(data, 'PersonID')).toEqual("'1','2','3'")
})

test('atom user should exist', () => {
    const user = {PersonID: '123', Person_Number: '321'};
    const userString = JSON.stringify(user)
    const resp = {data: userString};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return SyncTables.atomPersonExists('321').then(data => expect(data).toEqual(true));
});