const nodeHost = require('../aws/node/node');

module.exports = function (ir) {
  return Promise.all(ir.hosts.map(host => createHost({
    host: host,
    scope: ir.scopes[host.scope],
    role: ir.roles[host.scope],
    id: ir.id
  })));
};

function createHost (hostConfig) {
  if (hostConfig.host.compute === 'blob') {
    hostConfig.hostPackage = hostConfig.host.artifacts[0].artifact;
    return R(hostConfig);
  }
  return nodeHost(hostConfig);
}
