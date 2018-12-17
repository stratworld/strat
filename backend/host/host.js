const nodeHost = require('../aws/node/nodeHost');
const ArchiveBuilder = require('./archiveBuilder');

module.exports = function (ir) {
  return ir.hosts.map(host => {
    const data = createHost({
      host: host,
      scope: ir.scopes[host.scope]
    });
    return {
      data: data,
      role: ir.roles[host.scope],
      runtime: host.runtime,
      events: host.events,
      ...host
    };
  });
};

function createHost (hostConfig) {
  if (hostConfig.host.compute.type === 'blob') {
    return hostConfig.host.artifacts[0].data;
  }
  return nodeHost(hostConfig);
}
