const ArchiveBuilder = require('../../../util/archiveBuilder');
const stdPath = require('path');
const hostPrefab = stdPath.resolve(__dirname, 'prefab');
const hostFileDirectory = stdPath.resolve(hostPrefab, 'host/');
const ls = require('util').promisify(require('fs').readdir);
const hostDir = 'lit_generated_host';
const invocationsDir = `${hostDir}/invocations`;
const resolverPath = stdPath.resolve(__dirname, 'prefab/index.js');
const onHostInvoker = stdPath.resolve(__dirname, 'prefab/onHost.js');
const resolverPathDest = 'node_modules/lit';
const configDest = 'node_modules/lit/config.json';

module.exports = function (hostWithScope) {
  const host = new NodeHost(hostWithScope);
  return host.build()
    .then(() => host.data());
};

const NodeHost = function (config) {
  this.archiveBuilder = new ArchiveBuilder();
  this.host = config.host;
  this.scope = config.scope;
};

NodeHost.prototype.build = function () {
  return ls(hostFileDirectory)
    .then(files => {
      files
        .map(relativeFile => stdPath.resolve(hostFileDirectory, relativeFile))
        .forEach(absoluteFile => {
          this.archiveBuilder.copy(absoluteFile, hostDir);
        });

      this.host.artifacts.forEach(artifact => {
        this.archiveBuilder.addDataAsFile(artifact.data, `${artifact.name}/index.js`);
      });

      this.archiveBuilder.copy(resolverPath, resolverPathDest);

      this.archiveBuilder.copy(
        stdPath.resolve(hostPrefab, 'lit_generated_host_entry.js'));

      this.buildInvocations();

      this.archiveBuilder.addDataAsFile(
        this.getConfig(), configDest);
    });
};

NodeHost.prototype.buildInvocations = function () {
  const invocations = this.scope
    .values()
    .reduce((invocations, dependency) => {
      invocations[dependency.service] = dependency.invoke;
      return invocations;
    }, {
      onHost: onHostInvoker
    });

  invocations
    .purge()
    .pairs()
    .map(kvp =>
      this.archiveBuilder.copy(kvp[1],
        stdPath.join(invocationsDir, kvp[0])));
};

NodeHost.prototype.getConfig = function () {
  const config = {
    defaultFunction: this.host.name,
    scope: this.scope
      .keys()
      .reduce((newScope, functionName) => {
        const compute = this.scope[functionName].hostName === this.host.name
          ? {
              service: 'onHost',
              invoke: onHostInvoker,
              config: functionName
            }
          : this.scope[functionName];
        newScope[functionName] = {
          config: compute.config,
          // the relative require path from dependency index file to the invocation file
          invoke: `../../${invocationsDir}/${compute.service}/${stdPath.basename(compute.invoke)}`
        };
        return newScope;
      }, {})
  };
  console.log(JSON.stringify(config, null, 2));
  return Buffer.from(JSON.stringify(config));
};

NodeHost.prototype.data = function () {
  return this.archiveBuilder.data();
};
