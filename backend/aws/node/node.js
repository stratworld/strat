//code-gens a node host
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const cp = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);
const exec = promisify(require('child_process').exec);
const directories = require('../../../directories');
const hostFile = path.resolve(__dirname, 'prefab/', 'hostRoot.js');
const packageJson = path.resolve(__dirname, 'prefab/', 'package.json');
const prefabNodeModules = path.resolve(__dirname, 'prefab/', 'node_modules');
const functionDependency = path.resolve(__dirname, 'prefab/', 'functionDependency.js');
const resourceDependency = path.resolve(__dirname, 'prefab/', 'resourceDependency.js');


const NodeHost = function () {}

NodeHost.prototype.package = function (hostConfig) {
  const artifact = hostConfig.host.artifacts[0].artifact;

  return this.makeWorkDirectory()
    .then(() => this.resolveDependencies(hostConfig.scope))
    .then(() => {
      return this.buildHostConfig(artifact)
        .then(cfg => this.copyHostFiles(cfg));
    })
    .then(() => this.copyServiceFiles(artifact))
    .then(() => this.zipWorkDirectory(hostConfig.host.name))
    .then(zipFilePath => {
      hostConfig.hostPackage = zipFilePath;
      return hostConfig;
    });
};

NodeHost.prototype.makeWorkDirectory = function() {  
  return directories.fresh()
    .then(work => {
      this.work = work;
      this.service = path.join(this.work, '/service');
      this.configDest = path.join(this.work, 'config.json');
      return R();
    })
    .then(() => mkdir(this.service));
}

NodeHost.prototype.buildHostConfig = function (artifact) {
  return Promise.resolve({
    handler: path.basename(artifact)
  });
}

NodeHost.prototype.copyHostFiles = function (hostConfig) {
  return cp(hostFile, path.join(this.work, 'host.js'))
    .then(() => writeFile(this.configDest, JSON.stringify(hostConfig)));
}

NodeHost.prototype.copyServiceFiles = function (handlerPath) {
  return cp(handlerPath, path.join(this.service, path.basename(handlerPath)));
}

NodeHost.prototype.zipWorkDirectory = function (zipName) {
  const zipFilePath = path.resolve(this.work, zipName + '.zip');
  return exec(`zip -r ${zipName}.zip .`, { cwd: this.work })
    .then(() => Promise.resolve(zipFilePath));
}

NodeHost.prototype.copyPackageJson = function () {
  return cp(packageJson, path.join(this.work, 'package.json'));
}

NodeHost.prototype.resolveDependencies = function (scope) {
  return scope.keys().length === 0
    ? Promise.resolve()
    : this.copyPackageJson()
      .then(() => this.installSubstrateSdk())
      .then(() => this.createDependencyNpmPackages(scope
        .keys()
        .map(depName => {
          return {
            name: depName,
            ...scope[depName]
          }
        })));
}

NodeHost.prototype.installSubstrateSdk = function () {
  return exec(`cp -r ${prefabNodeModules} ${this.work}/node_modules`);
}

NodeHost.prototype.createDependencyNpmPackages = function (dependencies) {
  return Promise.all(dependencies
    .map(dep => this.createDependencyNpmPackage(dep)));
}

NodeHost.prototype.createDependencyNpmPackage = function (dependency) {
  const depPath = path.resolve(this.work, 'node_modules', `lit.${dependency.name}`);
  return mkdir(depPath)
    .then(() => {
      return dependency.service === 'lambda'
        ? cp(functionDependency, path.resolve(depPath, 'index.js'))
        : cp(resourceDependency, path.resolve(depPath, 'index.js'))
    })
    .then(() => writeFile(path.join(depPath, 'config.json'),
      JSON.stringify(dependency)));
}

module.exports = function (hostConfig) {
  const n = new NodeHost();
  return n.package(hostConfig);
}
