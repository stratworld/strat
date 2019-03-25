const hoster = require('../../lambdaRuntime/hostFactory')();

module.exports = function (ir) {
  return Promise.all(ir.hosts.map(host => {
    return createHost({
      host: host,
      scopes: ir.scopes
    }).then(data => R({
      data: data,
      //TODO: this is totally wrong; when we make roles
      // we need to go back and fix this.
      role: ir.roles[host.artifacts[0].scope],
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