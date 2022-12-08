const axios = require('../services/http')
const { AtomAPI } = require('./atomapi')

jest.mock('axios');

let atomapi;

beforeAll(() => {
    atomapi = new AtomAPI()
});


test('should get column values', () => {
    const data = [{
        PersonID: 1
    },{
        PersonID: 2
    },{
        PersonID: 3
    }]

    expect(atomapi.getColumnValuesString(data, 'PersonID')).toEqual("'1','2','3'")
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