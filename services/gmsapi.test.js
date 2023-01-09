const axios = require('../services/http')
const { GmsAPI } = require('./gmsapi')

jest.mock('axios');

test('should get enrollment request', () => {
    const resp = {data: "\n\n0,GMS1234,0"};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return GmsAPI.getEnrollmentRequest().then(data => expect(data).toEqual("GMS1234"));
});

test('should get an edited user', () => {
    const user = {id: '123', Person_Number: '321'};
    const resp = {data: [user]};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return GmsAPI.getSingleEditedUser().then(data => expect(data).toEqual(user));
});

test('should clear enrollment request', () => {
    const resp = {data: ""};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return GmsAPI.clearEnrollmentRequest().then(data => expect(data).toEqual(true));
});

test('should set person synced', () => {
    const resp = {data: ""};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return GmsAPI.personSyncedOnAtom(1).then(data => expect(data).toEqual(true));
});

test('should sync values to GMS', () => {
    const resp = {data: ""};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return GmsAPI.syncUp({}, 'id').then(data => expect(data).toEqual(true));
});