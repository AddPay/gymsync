const axios = require('./http')
const { AtomAPI } = require('./atomapi')

test('should get column values', () => {
    const data = [{
        PersonID: 1
    },{
        PersonID: 2
    },{
        PersonID: 3
    }]

    expect(AtomAPI.getColumnValuesString(data, 'PersonID')).toEqual("'1','2','3'")
})

test("Enroll a blank person number", () => {
    return AtomAPI.enrollPerson().then(data => expect(data).toEqual(false))
})

test("Enroll a non-existent person number", () => {
    return AtomAPI.enrollPerson('TEST1234').then(data => expect(data).toEqual(false))
})

test("Enroll an existent person number should be true", () => {
    return AtomAPI.enrollPerson('0001').then(data => expect(data).toEqual(true))
})

test("Find a blank person number should be false", () => {
    return AtomAPI.getPerson().then(data => expect(data).toEqual(false))
})

test("Find a non-existent person should be false", () => {
    return AtomAPI.getPerson('TEST1234').then(data => expect(data).toEqual(false))
})

test("Update a blank person should be false", () => {
    return AtomAPI.updatePerson().then(data => expect(data).toEqual(false))
})

test("Update a non-existent person should be false", () => {
    const person = {PersonID: '123', Person_Number: '321'};
    return AtomAPI.updatePerson(person).then(data => expect(data).toEqual(false))
})

test("Insert a blank person should be false", () => {
    return AtomAPI.insertPerson().then(data => expect(data).toEqual(false))
})

test("Get unsynced transactions should return an array", () => {
    return AtomAPI.getUnsyncedTransactions().then(data => expect(data.length).toBeGreaterThanOrEqual(0))
})

test("Get readers should return an array", () => {
    return AtomAPI.getReaders().then(data => expect(data.length).toBeGreaterThanOrEqual(0))
})

test("Get persons should return an array", () => {
    return AtomAPI.getUnsyncedPersons().then(data => expect(data.length).toBeGreaterThanOrEqual(0))
})