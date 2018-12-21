const ArchiveBuilder = require('./archiveBuilder');
const stdPath = require('path');
const hostPrefab = stdPath.resolve(__dirname, 'prefab');
const hostFileDirectory = stdPath.resolve(hostPrefab, 'host/');
const ls = require('util').promisify(require('fs').readdir);
const hostDir = 'lit_generated_host';
const invocationsDir = `${hostDir}/invocations`;

module.exports = function (hostConfig) {
  const builder = new ArchiveBuilder(hostConfig.host.artifacts[0]);
  const host = new NodeHost(hostConfig, builder);
  return host.build()
    .then(() => host.data());
};

const NodeHost = function (config, archiveBuilder) {
  this.archiveBuilder = archiveBuilder;
  this.config = config;
  this.artifact = config.host.artifacts[0];
};

NodeHost.prototype.build = function () {
  return ls(hostFileDirectory)
    .then(files => {
      files.forEach(file => {
        this.archiveBuilder.copy(stdPath.resolve(hostFileDirectory, file), hostDir);
      });

      this.archiveBuilder.copy(
        stdPath.resolve(hostPrefab, 'lit_generated_host_entry.js'));

      this.buildInvocations();

      this.archiveBuilder.addDataAsFile(
        this.getConfig(), `${hostDir}/config.json`);
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

function invocationFileName (service, invocationFilePath) {
  return `${service}-${stdPath.basename(invocationFilePath)}`;
}

//todo: routing
NodeHost.prototype.getConfig = function () {
  const config = {
    // if the artifact is a zip file, assume an index.js file in the root
    // else, then the actual file is the entry point
    handlerPath: this.artifact.type === '.zip'
      ? '../index.js'
      : '../' + stdPath.basename(this.artifact.path),
    scope: this.config.scope
      .map(value => {
        return {
          config: value.config,
          // the relative require path from the host file to the invocation file
          invoke: `../${invocationsDir}/${value.service}/${stdPath.basename(value.invoke)}`
        };
      })
  };
  return Buffer.from(JSON.stringify(config));
};

NodeHost.prototype.data = function () {
  return this.archiveBuilder.data();
};
