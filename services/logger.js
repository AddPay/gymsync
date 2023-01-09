// const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

class Logger {
  constructor(_label) {

    const _format = combine(
      label({ label: _label }),
      timestamp(),
      myFormat
    )

    const logger = createLogger({
      level: 'info',
      format: _format,
      transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
    });
    
    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (process.env.ENVIRONMENT !== 'production') {
      // logger.add(new transports.Console({
      //   format: format.simple(),
      //   level: 'debug'
      // }));
      logger.add(new transports.File({
        filename: 'logs/debug.log',
        level: 'debug'
      }));
    }
    
    logger.debug("logging started")

    return logger
  }
}

module.exports = { Logger }