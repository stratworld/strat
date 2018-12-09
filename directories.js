const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const mkdir = promisify(fs.mkdir);
const crypto = require('crypto');
const exec = promisify(require('child_process').exec);

module.exports = {
  fresh: fresh,
  clean: clean
};

// resolves with a fresh directory to be used for building
function fresh (optionalId) {
  const id = optionalId || crypto.randomBytes(4).toString('hex');
  const subDirectory = crypto.randomBytes(4).toString('hex');
  const buildDirectory = `/tmp/lit-build-${id}`;
  const subBuildDirectory = `/tmp/lit-build-${id}/${subDirectory}`;
  return mkdir(buildDirectory)
    .then(() => mkdir(subBuildDirectory))
    .then(() => subBuildDirectory);
}

function clean () {
  return exec('rm -r /tmp/lit-build*')
    .catch(e => {
      if (e.toString().indexOf('No such file') === -1) {
        return J(e);
      }
    });
}
