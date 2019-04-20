const path = require('path');
const compiler = require('../../compile')();
const { traverse, val } = require('../../../../stratc/ast');
const assert = require('assert');
const reflect = fileData => compiler(
  null,
  'reflection',
  fileData,
  path.resolve(__dirname, './fileInput.st'));

const emptyService = 'service empty {}';
const serviceWithOneFn = 'service one { foo ():any -> "sef"}';
const serviceWithSubs = `
async source X {}

service Y {
  X -> "foo"

  X 1 -> "bar"
}
`;

function getReflectionInfo (container) {
  const reflectFn = traverse(container, ['body', 'function'])
    .filter(fn => val(traverse(fn, ['functionName'])[0], 'name') === 'reflect')
    [0];
  const reflectionInfoString = reflectFn.tokens.artifact.value
    .replace(/.*JSON\.parse\('/, '')
    .replace(/'\);.*/, '');

  return JSON.parse(reflectionInfoString);
}

describe('reflection', () => {
  it('should add a reflection function', async () => {
    const result = await reflect(emptyService);
    const fnNamesSet = traverse(result, ['file', 'service', 'body', 'function', 'functionName'])
      .map(fnName => val(fnName, 'name'))
      .constantMapping(true);
    assert(fnNamesSet['reflect']);
  });
  it('should add service name inside info', async () => {
    const result = await reflect(emptyService);
    const info = getReflectionInfo(traverse(result, ['file', 'service'])[0]);
    assert(info.name === 'empty');
  });
  it('should add functions inside info', async () => {
    const result = await reflect(serviceWithOneFn);
    const info = getReflectionInfo(traverse(result, ['file', 'service'])[0]);
    const foo = info.functions[0];
    assert(foo.name === 'foo');
  });
  it('should add subscribers inside info', async () => {
    const result = await reflect(serviceWithSubs);
    const info = getReflectionInfo(traverse(result, ['file', 'source'])[0]);
    const subs = info.subscribers;
    //todo: little weak...
    assert(subs.length === 2);
  });
});