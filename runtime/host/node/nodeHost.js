const ArchiveBuilder = require('../../../util/archiveBuilder');
const stdPath = require('path');
const hostPrefab = stdPath.resolve(__dirname, 'prefab');
const hostFileDirectory = stdPath.resolve(hostPrefab, 'host/');
const ls = require('util').promisify(require('fs').readdir);
const hostDir = 'lit_generated_host';
const invocationsDir = `${hostDir}/invocations`;
const resolverPath = stdPath.resolve(__dirname, 'prefab/index.js');
const resolverPathDest = 'node_modules/lit';
const configDest = 'node_modules/lit/config.json';

module.exports = function (hostWithScope) {
  const host = new NodeHost(hostWithScope);
  // console.log(hostWithScope.scope)
  return host.build()
    .then(() => host.data());
};

const NodeHost = function (config) {
  this.archiveBuilder = new ArchiveBuilder();
  this.config = config;
  this.name = config.host.name;
  this.artifacts = host.artifacts;
};

NodeHost.prototype.build = function () {
  return ls(hostFileDirectory)
    .then(files => {
      files.forEach(file => {
        this.archiveBuilder.copy(stdPath.resolve(hostFileDirectory, file), hostDir);
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
  const invocations = this.config.scope
    .values()
    .reduce((invocations, dependency) => {
      invocations[dependency.service] = dependency.invoke;
      return invocations;
    }, {});

  invocations
    .pairs()
    .map(kvp =>
      this.archiveBuilder.copy(kvp[1],
        stdPath.join(invocationsDir, kvp[0])));
};

// function invocationFileName (service, invocationFilePath) {
//   return `${service}-${stdPath.basename(invocationFilePath)}`;
// }

NodeHost.prototype.getConfig = function () {
  const config = {
    // if the artifact is a zip file, assume an index.js file in the root
    // else, then the actual file is the entry point
    // handlerPath: this.artifact.type === '.zip'
    //   ? '../index.js'
    //   : '../' + stdPath.basename(this.artifact.path),
    onHost: getHandlers(this.artifacts),
    hostName: this.name,
    scope: this.config.scope
      .keys()
      .reduce((newScope, functionName) => {
        const compute = this.config.scope[functionName];
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

function getHandlers (artifacts) {
  //return a map functionName => handlerPath
  // todo: copy the artifact into a subdirectory of the host
}

NodeHost.prototype.data = function () {
  return this.archiveBuilder.data();
};
