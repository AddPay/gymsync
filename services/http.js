const axios = require('axios').default;
const { Logger } = require('../services/logger')
const logger = new Logger("HTTP")

// Add a request interceptor
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    let data = ''
    try {
      data = JSON.stringify(config.data)
    } catch (error) { }
    const message = `URL: ${config.url}; METHOD: ${config.method}; DATA: ${data}`
    logger.debug(message)
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
    let data = ''
    try {
      data = JSON.stringify(response.data)
    } catch (error) { }
    const message = `STATUS: ${response.status}; DATA: ${data}`
    logger.debug(message)
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    logger.error(error)
    return Promise.reject(error);
  });

module.exports = axios