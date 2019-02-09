const hoster = require('../../../runtime/host/hostFactory')();

module.exports = deps => function (ir) {
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

function createHost (hostWithScope) {
  if (hostWithScope.host.compute.type === 'blob') {
    return R(hostWithScope.host.artifacts[0].data);
  }
  return hoster(hostWithScope);
}
