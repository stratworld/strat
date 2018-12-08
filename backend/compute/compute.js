const awsResources = require('../aws/resources');
module.exports = function (ir) {
  ir.hosts = ir.hosts.map(host => createCompute(host, ir.id))
  ir.scopes = getScopeWithCompute(ir);

  return ir;
}

function createCompute (host, id) {
  host.compute = awsResources(host, id);
  return host;
}

function getScopeWithCompute (ir) {
  const implementationLookup = ir.hosts
    .reduce((lookup, host) => {
      lookup[host.name] = host.compute;
      return lookup;
    }, {});

  return ir.scopes
    .keys()
    .reduce((newScopes, nextScopeName) => {
      newScopes[nextScopeName] = ir.scopes[nextScopeName]
        .keys()
        .reduce((newScope, nextFunctionName) => {
          newScope[nextFunctionName] = implementationLookup[nextFunctionName];
          return newScope;
        }, {});
      return newScopes;
    }, {});
}