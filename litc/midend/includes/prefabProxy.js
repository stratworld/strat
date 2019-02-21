const Lit = require('lit');
module.exports = (event, declaration) => {
  const target = Lit(`${declaration.service}.${declaration.name.replace('public', '')}`);
  return target(event);
};
