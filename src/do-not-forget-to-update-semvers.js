'use strict'

const {
  SCC_STATE_PACKAGE_NAME,
  SCC_BROKER_PACKAGE_NAME,
  SCC_BROKER_CLIENT_PACKAGE_NAME
} = require('./constants')

const semvers = {
  [SCC_STATE_PACKAGE_NAME]: {
    required: {
      [SCC_BROKER_PACKAGE_NAME]: '^5.0.0',
    },
    reported: {
      [SCC_STATE_PACKAGE_NAME]: null,
    },
  },
  [SCC_BROKER_PACKAGE_NAME]: {
    required: {
      [SCC_STATE_PACKAGE_NAME]: '^3.0.0',
      [SCC_BROKER_CLIENT_PACKAGE_NAME]: '^8.0.0',
    },
    reported: {
      [SCC_BROKER_PACKAGE_NAME]: null,
    },
  },
  [SCC_BROKER_CLIENT_PACKAGE_NAME]: {
    required: {
      [SCC_BROKER_PACKAGE_NAME]: '^4.0.0',
      [SCC_STATE_PACKAGE_NAME]: '^3.0.0',
    },
    reported: {
      [SCC_BROKER_CLIENT_PACKAGE_NAME]: null,
      'sc-broker-cluster': null,
      'sc-broker': null,
      'sc-auth': null,
      'sc-uws': null,
      'uws': null,
      'ws': null,
      'socketcluster-client': null,
      'socketcluster': null,
    },
  },
}
module.exports = semvers
