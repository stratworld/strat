const domoConstructor = require('../../../std/majordomo/majordomo');
// const mockRequire = require('../../mocks/mockLoader');
const mockRequire = require('mock-require');

module.exports = async function (mockEnvironment, hostName) {
  const invoker = async (targetName, event) => {
    if (mockEnvironment[targetName]) {
      return await mockEnvironment[targetName](event);
    }
    throw new Error(`Could not resolve name ${targetName}`);
  };
  const domo = await domoConstructor(invoker, hostName);
  mockRequire('strat', {
    getResolver: function () { return domo; }
  });

  // we need to load in the modules that require strat AFTER
  // we've added our mock strat env.
  mockEnvironment.pairs().forEach(kvp => {
    if (typeof kvp[1] === 'string') {
      delete require.cache[require.resolve(kvp[1])];
      mockEnvironment[kvp[0]] = require(kvp[1]);
    }
  })
  return domo;
};
