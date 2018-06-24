'use strict'

const
  log = require('./logger'),
  constants = require('./constants'),
  collectIssues = require('./collectIssues'),
  semvers = require('./do-not-forget-to-update-semvers'),
  { InvalidArgumentsError, UnknownError } = require('sc-errors')

class Reporter {
  constructor(reporterName) {
    const
      argumentsAreConsistent = reporterName && typeof reporterName === 'string',
      reporterNameIsValid = Object.keys(semvers).includes(reporterName)

    if (!argumentsAreConsistent || !reporterNameIsValid) {
      const err = new InvalidArgumentsError(
        `Wrong argument in sccSemverReporter constructor.
        It should be a SCC component package name, from its package.json
        Instead provided: ${reporterName}`)
      throw err
    }

    this.report = null
    this.reports = []
    this.reporterName = reporterName

    for (const key in constants)
      this[key] = constants[key]
  }

  prepareSemverReport() {
    if (this.report)
      return 'report is ready already'

    let report = this.report = Object.assign({
      cssh: this.cssh,
      cssp: this.cssp,
      reporter: {
        port: this.sccBrokerPort || this.sccBrokerClientPort
      },
    }, semvers[this.reporterName])

    for (const packageName in report.reported) {
      try {
        const packageSemver = require.main.require(`${packageName}/package.json`).version
        report.reported[packageName] = packageSemver

        if (packageName === this.reporterName) {
          report.reporter['packageName'] = packageName
          report.reporter['packageSemver'] = packageSemver
        }
      } catch (err) {
        // not an err
      }
    }

    this.saveReport(report)

    return 'report is ready'
  }

  /**
   * Attach and initialize this module.
   *
   * @param {SCClientSocket|SCServerSocket} socket
   * @param {Object} options
   */
  attach(socket, options = {}) {
    if (typeof options.logLevel !== 'undefined')
      log.setLogLevel(Number(options.logLevel))

    // save scc-state's ip and port in order to include them in the report later
    // it's a little trick to let scc-state know it's own address
    this.cssh = options.cssh
    this.cssp = options.cssp
    // save the following ports in order to include them in the report later
    this.sccBrokerPort = options.sccBrokerPort
    this.sccBrokerClientPort = options.sccBrokerClientPort

    if (this.reporterName === constants.SCC_STATE_PACKAGE_NAME) {
      this.prepareSemverReport()
      subscribeSocketForIssues(socket)
      this.listenReports(socket)
      return 'listening for reports'
    } else {
      socket.on('connect', this.onConnect.bind(this, socket))
      return 'waiting for connection'
    }
  }

  onConnect(socket) {
    this.prepareSemverReport()
    subscribeSocketForIssues(socket)
    this.emitReport(socket)
    return 'connected and submitted a report'
  }

  /**
   * Listen for reports from scc-brokers, scc-broker-clients and
   * maybe something else in the future
   */
  listenReports(socket) {
    socket.off(constants.SCC_SEMVER_REPORT_EVENT)
    socket.on(constants.SCC_SEMVER_REPORT_EVENT, this.checkIncomingReport.bind(this, socket))
    return 'listening for reports'
  }

  checkIncomingReport(socket, report, callback) {
    callback && callback() // prevent TimeoutError

    // store scc-state's ip and port
    if (report.cssh && report.cssp) {
      const indexOfReportBySccState = 0 // always first report in this.reports
      this.reports[indexOfReportBySccState].reporter.ip = report.cssh
      this.reports[indexOfReportBySccState].reporter.port = report.cssp
    }

    report.reporter.ip = socket.instanceIp
    report.reporter.port = report.reporter.port || socket.instancePort

    this.saveReport(report)

    const issues = collectIssues(this.reports, report)
    if (issues.length)
      this.publishIssues(issues, socket)
  }

  emitReport(socket) {
    const emit = (socket.emit && socket.emit.bind(socket))

    setTimeout(() => {
      emit(constants.SCC_SEMVER_REPORT_EVENT, this.report, err => {
        if (err) {
          setTimeout(this.emitReport.bind(this, socket), constants.EMIT_PUBLISH_TIMER)
          log.verbose('scc-semver-report emit error: ', err)
        }
      })
    }, constants.EMIT_PUBLISH_TIMER)
  }

  saveReport(report) {
    const indexOfPreviousReport = this.reports.findIndex(savedReport => {
      if (report.reporter.ip !== savedReport.reporter.ip)
        return false
      else if (report.reporter.port !== savedReport.reporter.port)
        return false
      else
        return true
    })

    if (indexOfPreviousReport > -1)
      this.reports.slice(indexOfPreviousReport, 1, report) // renew the report
    else
      this.reports.push(report)
  }

  publishIssues(issues, socket) {
    setTimeout(() => {
      publishViaSocket(socket, constants.SCC_SEMVER_REPORT_CHANNEL, issues, err => {
        if (err)
          log.verbose('scc-semver-report publish error: ', err)
      })
    }, constants.EMIT_PUBLISH_TIMER)
  }
}

module.exports = Reporter

/**
 * @returns {SCChannel} channel
 */
function getChannelFromSocket(socket, channelName) {
  let getChannel = null

  if (socket.channel)
    getChannel = socket.channel.bind(socket)
  else if (socket.exchange.channel)
    getChannel = socket.exchange.channel.bind(socket.exchange)
  else {
    const err = new UnknownError(
      `scc-semver-report cannot find nor 'socket.channel' nor 'socket.exchange.channel' function.
      Probably SocketCluster's API has been changed.
      Please, open up an issue againts 'scc-semver-report' repo on Github.`)
    throw err
  }

  return getChannel(channelName)
}

function publishViaSocket(socket, ...args) {
  let publish = null

  if (socket.publish)
    publish = socket.publish.bind(socket)
  else if (socket.exchange && socket.exchange.publish)
    publish = socket.exchange.publish && socket.exchange.publish.bind(socket.exchange)
  else {
    const err = new UnknownError(
      `scc-semver-report cannot find nor 'socket.publish' nor 'socket.exchange.publish' function.
      Probably SocketCluster's API has been changed.
      Please, open up an issue againts 'scc-semver-report' repo on Github.`)
    throw err
  }

  return publish(...args)
}

function subscribeSocketForIssues(socket) {
  const channel = getChannelFromSocket(socket, constants.SCC_SEMVER_REPORT_CHANNEL)

  if (!channel.isSubscribed())
    channel.subscribe({ waitForAuth: false })

  channel.unwatch()
  channel.watch(displayIssues)

  return 'subscribed'
}

function displayIssues(issues) {
  issues.forEach(i => {
    log.error(
      `Compatibility issue: ${i.reporter.packageName}@${i.reporter.packageSemver} [${i.reporter.ip}:${i.reporter.port}] is incompatible with ${i.issue.packageName}@${i.issue.packageSemver} [${i.issue.ip}:${i.issue.port}] Please, update the ${i.issue.packageName} to version ${i.issue.requiredSemver}`)
  })
}
