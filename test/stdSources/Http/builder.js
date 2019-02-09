const builder = require('../../../stdSources/Http/builder');
const assert = require('assert');

const x = [
  {
    eventName: "Http",
    eventConfig: {
      method: "get",
      path: "*"
    },
    functionName: "Foo.foo",
    isResource: false,
    artifact: "./foo.js"
  }
];

describe('Http builder', () => {
  it('should build', () => {
    builder(x);
  });
  it('should build the correct routes', async () => {
    const builderData = (await builder(x)).toString();

    const firstEqual = builderData.indexOf('=');
    const firstSemi = builderData.indexOf(';');

    const routeData = JSON.parse(
      builderData.slice(firstEqual + 1, firstSemi));

    return assert.deepStrictEqual(routeData, [
      {
        method: "get",
        path: "*",
        function: "Foo.foo",
        headers: { "Content-Type": "application/json" }
      }
    ]);
  });
});
