const assert = require('assert');
const builder = require('../../../stdSources/Http/builder');
const cases = require('./routingCases');

describe('Http paths', () => {
  cases.forEach(testCase => {
    it(`should route ${testCase.name}`, async () => {
      const builderData = (await builder(testCase.dispatches)).toString();

      // nasty
      const newBuilder = builderData
        .replace(/const Strat.*;/g, '')
        .replace(/Strat\(.*\)/g, '(event => Promise.resolve(event))')
        .replace(/module\.exports/g, 'proxyModule');
      var proxyModule;
      eval(newBuilder);

      const result = await proxyModule(testCase.event);

      return assert.deepStrictEqual(result, testCase.result);
    });
  });
});
