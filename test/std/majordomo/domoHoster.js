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

  // we need to load in the modules that require strat AFTER
  // we've added our mock strat env.
  mockEnvironment.pairs().forEach(kvp => {
    if (typeof kvp[1] === 'string') {
      delete require.cache[require.resolve(kvp[1])];
      mockEnvironment[kvp[0]] = require(kvp[1]);
    }
  })
  return ret;
};
