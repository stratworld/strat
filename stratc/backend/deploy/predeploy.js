module.exports = () => async ir => {
  const preDeploy =
    require('../../../svs/substrate/substrateFactory')().preDeploy;
  if (typeof preDeploy === 'function') {
    await preDeploy(ir);
    return ir;
  }
  return ir;
};
