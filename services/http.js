const axios = require('axios').default;
const logger = require('./logger')

// Add a request interceptor
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    logger.debug(config)
    return config;
  }, function (error) {
    // Do something with request error
    logger.error(error)
    return Promise.reject(error);
  });

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    logger.debug(response)
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    logger.error(error)
    return Promise.reject(error);
  });

module.exports = axios