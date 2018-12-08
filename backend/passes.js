const path = require('path');

module.exports = [
  {
    name: 'roles',
    entry: path.resolve(__dirname, 'roles/roles')
  },
  {
    name: 'compute',
    entry: path.resolve(__dirname, 'compute/compute')
  },
  {
    name: 'buildhost',
    entry: path.resolve(__dirname, 'host/host')
  },
  {
    name: 'deploy',
    entry: path.resolve(__dirname, 'deploy/deploy')
  }
];
