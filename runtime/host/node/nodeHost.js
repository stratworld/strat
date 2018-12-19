const ArchiveBuilder = require('./archiveBuilder');
const stdPath = require('path');
const hostPrefab = stdPath.resolve(__dirname, 'prefab');
const hostDir = 'lit_generated_host';
const copyFiles = [
  'host.js'
];

module.exports = function (hostConfig) {
  const builder = new ArchiveBuilder(hostConfig.host.artifacts[0]);
  const host = new NodeHost(hostConfig, builder);
  host.build();
  return host.data();
};

const NodeHost = function (config, archiveBuilder) {
  this.archiveBuilder = archiveBuilder;
  this.config = config;
  this.artifact = config.host.artifacts[0];
};

NodeHost.prototype.build = function () {
  copyFiles.forEach(file => {
    this.archiveBuilder.copy(stdPath.resolve(hostPrefab, file), hostDir);
  });
  this.archiveBuilder.copy(
    stdPath.resolve(hostPrefab, 'lit_generated_host_entry.js'));

  this.archiveBuilder.addDataAsFile(
    this.getConfig(), `${hostDir}/config.json`);
};

// todo: figure out routing and supplying dependency invocation files/configs
NodeHost.prototype.getConfig = function () {
  const config = {
    // if the artifact is a zip file, assume an index.js file in the root
    // else, then the actual file is the entry point
    handlerPath: this.artifact.type === '.zip'
      ? '../index.js'
      : '../' + stdPath.basename(this.artifact.path),
    scope: this.config.scope
  };
  return Buffer.from(JSON.stringify(config));
};

NodeHost.prototype.data = function () {
  return this.archiveBuilder.data();
};
