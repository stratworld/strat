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
  First,
  Birth -> "foo"
  First -> "bar"
}`;

const oneDispatch = `source OneDispatch {
  Birth -> "foo"
}`;

const dispatchWithPattern = `
source pattern {
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
    assert(result.subscribers.First.length === 2);
  });
  it('should add the event pattern', async () => {
    const result = await subscribe(dispatchWithPattern);
    assert(typeof result.subscribers.Http[0].pattern === 'object');
  });
});
