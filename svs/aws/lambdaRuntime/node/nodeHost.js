const ArchiveBuilder = require('../../../../util/archiveBuilder');
const stdPath = require('path');
const hostPrefab = stdPath.resolve(__dirname, 'prefab');
const invocationsDir = 'node_modules/strat/invocations';
const configDest = 'node_modules/strat/config.json';

module.exports = async function (hostWithScope) {
  const host = new NodeHost(hostWithScope);
  await host.build()
  return host.data();
};

const NodeHost = function (config) {
  this.archiveBuilder = new ArchiveBuilder();
  this.host = config.host;
  this.scopes = config.scopes;
};

NodeHost.prototype.build = async function () {
  await this.archiveBuilder.copyDirectory(hostPrefab);

  this.host.artifacts.forEach(artifact => {
    this.archiveBuilder.addDataAsFile(artifact.data, `${artifact.name}/index.js`);
  });

  this.copyInvocations();

  this.archiveBuilder.addDataAsFile(this.getConfig(), configDest);
};

NodeHost.prototype.copyInvocations = function () {
  const invocations = this.scopes
    .values()
    .flatmap(scope => scope.values())
    .reduce((invocations, dependency) => {
      invocations[dependency.service] = dependency.invoke;
      return invocations;
    }, {});

  invocations
    .purge()
    .pairs()
    .map(kvp =>
      this.archiveBuilder.copy(kvp[1],
        stdPath.join(invocationsDir, kvp[0], 'index.js')));
};

NodeHost.prototype.getConfig = function () {
  const hostName = this.host.name;
  const config = {
    defaultFunction: hostName,
    scopes: this.buildScopes(hostName)
  };
  return Buffer.from(JSON.stringify(config));
};

NodeHost.prototype.buildScopes = function (hostName) {
  return this.scopes
    .keys()
    .reduce((newScopes, scopeName) => {
      newScopes[scopeName] = buildScope(this.scopes[scopeName], hostName);
      return newScopes;
    }, {});
}

function buildScope (scope, hostName) {
  return scope
    .keys()
    .reduce((newScope, functionName) => {
      if (scope[functionName].hostName === hostName) {
        newScope[functionName] = {
          service: 'onHost',
          config: {
            declaration: scope[functionName].declaration,
            functionName: functionName,
            shouldntWrap: hostName === functionName
          }
        }
      } else {
        newScope[functionName] = {
          service: scope[functionName].service,
          config: scope[functionName].config
        }
      }
      return newScope;
    }, {});
}

NodeHost.prototype.data = function () {
  return this.archiveBuilder.data();
};
