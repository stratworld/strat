const config = require('../config')();

module.exports = function () {
  const substrate = config.substrate;
  if (substrate === 'aws') {
    return require('./aws/aws');
  }
  return require('./local/local');
};
