//todo
// each scope should map to a role or policy that can
// invoke anything within the scope.  Each compute
// should be created with the role it's host's scope maps to

// we want the substrate to create roles for us, but this is a manual
const preCreatedRole = require('../../litconfig.json').aws.preCreatedRole
module.exports = function (ir) {
  ir.roles = ir.scopes
    .keys()
    .constantMapping(preCreatedRole);
  return ir;
}
