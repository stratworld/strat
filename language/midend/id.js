const crypto = require('crypto');

module.exports = function (ast) {
  ast.tokens.id = {
    value: crypto.randomBytes(4).toString('hex'),
    line: 0,
    type: 'STRING'
  };
  return ast;
}