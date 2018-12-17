const path = require('path');

module.exports = [
  {
    name: 'includes',
    entry: path.resolve(__dirname, 'includes/index')
  },
  {
    name: 'names',
    entry: path.resolve(__dirname, 'names/index')
  },
  {
    name: 'libinclude',
    entry: path.resolve(__dirname, 'libs/include')
  },
  {
    name: 'connector',
    entry: path.resolve(__dirname, 'libs/connector')
  },
  {
    name: 'loader',
    entry: path.resolve(__dirname, 'artifacts/loader')
  },
  {
    name: 'id',
    entry: path.resolve(__dirname, 'id.js')
  },
  {
    name: 'host',
    entry: path.resolve(__dirname, 'host/toHost')
  }
];
