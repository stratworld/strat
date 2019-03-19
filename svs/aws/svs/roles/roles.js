const roles = require('../../awsResources/iam/iam');
module.exports = function (ir) {
  ir.roles = roles(ir);
  return ir;
}
