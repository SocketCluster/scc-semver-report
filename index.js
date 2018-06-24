'use strict'

/**
 * SocketCluster Cluster Semver Report
 *
 * WHY:
 * Each SCC component has some requirements for semvers of other SCC components.
 * For example: `scc-broker-client@5.0.0` doesn't work with `scc-state@1.5.2`.
 *
 * When you try to launch incompatible versions of SCC components,
 * you get things broken either silently or with some errors in stderr.
 * And the errors, which you could see, are completely incomprehensible,
 * like "RangeError: Maximum call stack size exceeded".
 * It's really hard to guess the real issue that caused the errors.
 *
 * WHAT:
 * sccSemverReport tries to find any incompatible components on all servers in SCC
 * and, if any, publishes "compatibility errors" to stderr of all the components.
 * This module doesn't throw those errors, just outputs to stderr.
 *
 * The errors may look like:
 * Compatibility issue: scc-broker-client@5.0.2 [192.168.0.44:8000] is incompatible
with scc-broker@2.2.3 [192.168.0.101:8888] Please, update the scc-broker to version ^4.0.0
 */

let reporter = null
const
  constants = require('./src/constants'),
  Reporter = require('./src/Reporter')

/**
 * Pick an appropriate reporter.
 *
 * @param {string} reporterName - the packageName of the current SCC component
 * @returns {Reporter} attachable semver reporter
 * @throws {InvalidArgumentsError} if reporterName is invalid.
 */
function getReporter(reporterName) {
  const weDontHaveSuchReporter = (!reporter || reporter.reporterName !== reporterName)
  if (weDontHaveSuchReporter)
    reporter = new Reporter(reporterName)

  return reporter
}

/**
 * Expose internal constants.
 *
 * @example
 * const sccSemverReport = require('scc-semver-report')
 * sccSemverReport.SCC_STATE_PACKAGE_NAME === 'scc-state' // true
 */
for (const key in constants)
  getReporter[key] = constants[key]

module.exports = getReporter
