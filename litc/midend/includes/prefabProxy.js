const Lit = require('lit');
module.exports = (event, declaration) => {
  console.log('here')
  Lit(`this.${declaration.name.replace('public', '')}`)(event);
};
