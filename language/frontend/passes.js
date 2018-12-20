const path = require('path');

module.exports = [
  {
    name: 'scan',
    entry: path.resolve(__dirname, 'scanning/scanner')
  },
  {
    name: 'parse',
    entry: path.resolve(__dirname, 'parsing/parser')
  }
];
