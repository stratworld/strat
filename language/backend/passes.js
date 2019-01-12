const path = require('path');

module.exports = [
  {
    name: 'ingest',
    entry: path.resolve(__dirname, 'ingest/ingest')
  },
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
  },
  {
    name: 'connect',
    entry: path.resolve(__dirname, 'connect/connect')
  }
];
