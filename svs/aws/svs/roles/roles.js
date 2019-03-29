const roles = require('../../awsResources/iam/iam');

module.exports = async function (ir) {
  ir.roles = await roles(ir);
  return ir;
}
