const config = require('../config')();

module.exports = function () {
  const substrate = config.substrate;
  return require(`./${substrate}`);
};
