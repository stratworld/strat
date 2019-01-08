//todo
// each scope should map to a role or policy that can
// invoke anything within the scope.  Each compute
// should be created with the role it's host's scope maps to
const preCreatedRole = require('../../../config')().aws.preCreatedRole;
module.exports = function (ir) {
  return ir.scopes
    .keys()
    .constantMapping(preCreatedRole);
}