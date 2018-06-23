'use strict'

const constants = {
  DEFAULT_LOG_LEVEL: 1, // errors only
  // delay between socket.on('connection') and Reporter.emitReport()
  EMIT_PUBLISH_TIMER: 1000, // ms

  SCC_SEMVER_REPORT_EVENT: 'sccSemverReport',
  SCC_SEMVER_REPORT_CHANNEL: 'sccSemverReportChannel',

  SCC_STATE_PACKAGE_NAME: 'scc-state',
  SCC_BROKER_PACKAGE_NAME: 'scc-broker',
  SCC_BROKER_CLIENT_PACKAGE_NAME: 'scc-broker-client',
}

module.exports = constants
