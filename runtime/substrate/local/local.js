//todo: this is brittle and doesn't inform the user what's needed
const statedBuildLocation = require('../../config')().local.directory;
const path = require('path');
const buildLocation = path.resolve(statedBuildLocation);
const fs = require('fs');

module.exports = {
  info: {
    substrate: 'local'
  },
  resources: function (host, id) {
    try {
      fs.mkdirSync(buildLocation);
    } catch (e) {
      // drop--the build directory is already created; this is fine
      // can also throw because of incorrect buildLocation config
      // but that will be exposed below
    }
    // don't try-drop around this--if this id is already built
    // then we want to throw because lit deploy on the same .sys file
    // is not idempotent by design
    fs.mkdirSync(path.resolve(buildLocation, id));
    return host.runtime === undefined
      ? getResourceImplementation(host, id)
      : getFunctionImplementation(host, id)
  }
};

function getResourceImplementation (host, id) {
  return {
    type: 'blob',
    service: 'read',
    create: path.resolve(__dirname, 'resource/create.js'),
    invoke: path.resolve(__dirname, 'resource/invoke.js'),
    config: {
      path: path.join(buildLocation, id, host.name)
    }
  };
}

function getFunctionImplementation (host, id) {
  return {
    type: 'function',
    service: 'compute',
    create: path.resolve(__dirname, 'compute/create.js'),
    invoke: path.resolve(__dirname, 'compute/invoke.js'),
    config: {
      path: path.join(buildLocation, id, host.name)
    }
  };
}
