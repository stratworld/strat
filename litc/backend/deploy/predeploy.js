module.exports = () => async ir => {
  const preDeploy =
    require('../../../runtime/substrate/substrateFactory')().preDeploy;
  if (typeof preDeploy === 'function') {
    await preDeploy(ir);
    return ir;
  }
  return ir;
};
