const path = require('path');
const compiler = require('../../compile')();
const { traverse, val } = require('../../../../stratc/ast');
const assert = require('assert');
const subscribe = fileData => compiler(
  null,
  'subscribers',
  fileData,
  path.resolve(__dirname, './fileInput.st'));

const multipleDispatch = `source MultipleDispatch {
  include "Extern"
  include "Birth"
  Extern,
  Birth -> "foo"
  Birth -> "bar"
}`;

const oneDispatch = `source OneDispatch {
  include "Birth"
  Birth -> "foo"
}`;

const dispatchWithPattern = `
source pattern {
  include "Http"
  Http { method: "get", path: "*" } -> x ():any -> "./x.js"
}
`;

describe('subscribers', () => {
  it('should create the subscribers property on the ast', async () => {
    const result = await subscribe(oneDispatch);
    assert(typeof result.subscribers === 'object');
  });
  it('should create a subscriber for multiple events', async () => {
    const result = await subscribe(multipleDispatch);
    assert(result.subscribers.Birth.length === 2);
  });
  it('should add the event pattern', async () => {
    const result = await subscribe(dispatchWithPattern);
    const resultPattern = result.subscribers.Http[0].pattern;
    assert(typeof resultPattern === 'object');
    assert.deepStrictEqual({
      method: "get",
      path: "*"
    }, resultPattern);
  });
});
