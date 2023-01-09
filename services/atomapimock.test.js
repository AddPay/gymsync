const axios = require('./http')
const { AtomAPI } = require('./atomapi')

jest.mock('axios');

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

// test('atom user should exist', () => {
//     const user = {PersonID: '123', Person_Number: '321'};
//     const userString = JSON.stringify(user)
//     const resp = {data: userString};
//     axios.get.mockResolvedValue(resp);
  
//     // or you could use the following depending on your use case:
//     // axios.get.mockImplementation(() => Promise.resolve(resp))
  
//     return AtomAPI.personExists('321').then(data => expect(data).toEqual(true));
// });

test("Should find the Atom Person", () => {
    const user = {PersonID: '123', Person_Number: '321'};
    const resp = {data: user};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return AtomAPI.personExists('321').then(data => expect(data).toEqual(true));
})

test("Find an existent person", () => {
    const user = {PersonID: '123', Person_Number: '321'};
    const resp = {data: user};
    axios.get.mockResolvedValue(resp);

    return AtomAPI.getPerson('321').then(data => expect(data).toBeTruthy())
})

test("Update an existent person", () => {
    const person = {PersonID: '123', Person_Number: '321'};
    const resp = {data: ''};
    axios.put.mockResolvedValue(resp);

    return AtomAPI.updatePerson(person).then(data => expect(data).toEqual(true))
})

test("Should insert a person", () => {
    const person = {PersonID: '123', Person_Number: '321'};
    const resp = {data: ''};
    axios.put.mockResolvedValue(resp);

    return AtomAPI.updatePerson(person).then(data => expect(data).toEqual(true))
})