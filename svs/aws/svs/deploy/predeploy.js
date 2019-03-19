const preDeploy =
    require('../../awsResources/aws').preDeploy;
module.exports = async ir => {
  
  if (typeof preDeploy === 'function') {
    await preDeploy(ir);
    return ir;
  }
  return ir;
};
