const hoster = require('../../../runtime/host/hostFactory')();

module.exports = function (ir) {
  return Promise.all(ir.hosts.map(host => {
    return createHost({
      host: host,
      scope: ir.scopes[host.scope]
    }).then(data => R({
      data: data,
      role: ir.roles[host.scope],
      runtime: host.runtime,
      events: host.events,
      ...host
    }));
  }));
};

function createHost (hostConfig) {
  if (hostConfig.host.compute.type === 'blob') {
    return R(hostConfig.host.artifacts[0].data);
  }
  return hoster(hostConfig);
}
