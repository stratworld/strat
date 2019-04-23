const domoConstructor = require('../../../std/majordomo/majordomo');

module.exports = async function (mockEnvironment, hostName) {
  const invoker = async (targetName, event) => {
    if (mockEnvironment[targetName]) {
      return await mockEnvironment[targetName](event);
    }
    throw new Error(`Could not resolve name ${targetName}`);
  };
  const domo = await domoConstructor(invoker, hostName);
  const ret = fnName => domo(fnName);
  ret.dispatch = async event => await domo.dispatch(event);

  //Haskell eat your heart out
  require('strat').setExport(ret);
  return ret;
};
