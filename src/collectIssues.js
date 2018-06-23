'use strict'
const
  log = require('./logger'),
  semver = require('semver')

module.exports = collectIssues

/**
 * @param {Object[]} reports - a collection of reports to check against
 * @param {Object} aReport - a report to check compatibility with
 * @returns issues - array of compatibility issues, if any
 */
function collectIssues(reports, aReport) {
  const issues = []

  reports.forEach(report => {
    Array.prototype.push.apply(issues, findIssues(report, aReport))
    if (report.reporter.packageName !== aReport.reporter.packageName)
      Array.prototype.push.apply(issues, findIssues(aReport, report))
  })

  return issues
}

/**
 *
 */
function findIssues(r1, r2) {
  // check if r2 meets requirements of r1
  const
    issues = [],
    requiredModules = Object.keys(r1.required)

  for (const reportedPackageName in r2.reported) {
    const intersection = requiredModules.includes(reportedPackageName)
    if (!intersection)
      continue

    let
      requiredSemver = r1.required[reportedPackageName],
      reportedSemver = r2.reported[reportedPackageName]

    reportedSemver = semver.valid(semver.coerce(reportedSemver))

    const compatible = semver.satisfies(reportedSemver, requiredSemver)
    if (compatible)
      continue
    else {
      const issue = {
        issue: {
          ip: r2.reporter.ip,
          port: r2.reporter.port,
          packageName: reportedPackageName,
          packageSemver: reportedSemver,
          requiredSemver,
        },
        reporter: Object.assign({}, r1.reporter),
      }
      issues.push(issue)
    }
  }

  return issues
}
