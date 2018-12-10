const fs = require('fs');
const path = require('path');
const os = require('os');
const promisify = require('util').promisify;
const mkdir = promisify(fs.mkdtemp);
const crypto = require('crypto');
const exec = promisify(require('child_process').exec);

module.exports = {
  fresh: fresh,
  clean: clean
};

// resolves with a fresh directory to be used for building
function fresh (optionalId) {
  return mkdir(path.join(os.tmpdir(), (optionalId === undefined
    ? 'lit-build-'
    : `lit-build-${optionalId}`)));
}

function clean () {
  return exec(`rm -r ${path.join(os.tmpdir(), 'lit-build') + '-*'}`)
    .catch(e => {
      if (e.toString().indexOf('No such file') === -1) {
        return J(e);
      }
    });
}
