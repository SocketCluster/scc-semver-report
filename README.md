### SocketCluster Cluster Semver Report


`scc-broker` and `scc-broker-client` do connect to `scc-state`. sccSemverReport attaches itself to the sockets created in the process.

Once a scc-component connects to `scc-state` it composes a semver report and `emit`s it to `scc-state`.

`scc-semver-report` collects the reports, and tries to find any compatibility issues between reported and required semvers in all collected reports. If it finds any, `scc-semver-report` on `scc-state` publishes the issues to all the scc-components, which display the errors in their stderr.
