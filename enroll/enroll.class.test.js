const axios = require('../services/http')
const { Enroll } = require('./enroll.class')

jest.mock('axios');

let enroll;

beforeAll(() => {
    enroll = new Enroll()
});

test('should get enrollment request', () => {
    const resp = {data: "\n\n0,GMS1234,0"};
    axios.get.mockResolvedValue(resp);
  
    // or you could use the following depending on your use case:
    // axios.get.mockImplementation(() => Promise.resolve(resp))
  
    return enroll.getEnrollRequest().then(data => expect(data).toEqual("GMS1234"));
});