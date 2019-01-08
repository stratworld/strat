const substrateRoles = require('../../../runtime/substrate/substrateFactory')().roles;
module.exports = function (ir) {
  if (substrateRoles !== undefined) {
    ir.roles = substrateRoles(ir);
  } else {
    ir.roles = {};
  }
  return ir;
}
