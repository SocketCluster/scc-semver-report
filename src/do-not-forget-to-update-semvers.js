'use strict'

const semvers = {
  'scc-state': {
    required: {
      'scc-broker': '^3.0.0',
    },
    reported: {
      'scc-state': null,
    },
  },
  'scc-broker': {
    required: {
      'scc-state': '^3.0.0',
      'scc-broker-client': '^5.0.0',
    },
    reported: {
      'scc-broker': null,
    },
  },
  'scc-broker-client': {
    required: {
      'scc-broker': '^3.0.0',
      'scc-state': '^3.0.0',
    },
    reported: {
      'scc-broker-client': null,
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
