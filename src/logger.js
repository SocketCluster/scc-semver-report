'use strict'

const constants = require('./constants')

/**
 * The simpliest logger ever.
 *
 * Log levels:
 * 0 - log nothing
 * 1 - errors only
 * 2 - warnings, errors
 * 3 - info, warnings, errors
 * 4 - log everything
 */
class Logger {
  constructor() {
    this.setLogLevel(constants.DEFAULT_LOG_LEVEL)
  }

  setLogLevel(logLevel) {
    this.logLevel = logLevel
  }

  error(...args) {
    if (this.logLevel > 0)
      console.error(...args)
  }

  warn(...args) {
    if (this.logLevel >= 2)
      console.warn(...args)
  }

  info(...args) {
    if (this.logLevel >= 3)
      console.info(...args)
  }

  verbose(...args) {
    if (this.logLevel >= 4)
      console.info(...args)
  }
}

const logger = new Logger()
module.exports = logger
