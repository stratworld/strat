const Strat = require('strat').getResolver();
const emit = Strat('this.emit');

module.exports = async function formatHttpEvent (rawRequest) {

  //try catch errors here and figure out what to do with them
  const result = await emit(rawRequest);

  return {
    status: 200,
    body: result
  };
};
