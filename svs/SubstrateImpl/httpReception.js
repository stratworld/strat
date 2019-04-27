const Strat = require('strat').getResolver();
const emit = Strat('this.emit');

module.exports = async function formatHttpEvent (rawRequest) {
  return await emit(rawRequest);
};
