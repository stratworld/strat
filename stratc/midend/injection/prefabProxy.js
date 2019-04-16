const Strat = require('strat');
module.exports = (event, declaration) => {
  const target = Strat(`${declaration.service}.${declaration.name.replace('public', '')}`);
  return target(event);
};
