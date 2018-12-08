const crypto = require('crypto');

module.exports = function (ir) {
  ir.tokens.id = {
    value: crypto.randomBytes(4).toString('hex'),
    line: 0,
    type: 'STRING'
  };
  return ir;
}