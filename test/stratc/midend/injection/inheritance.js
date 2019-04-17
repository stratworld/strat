const path = require('path');
const compiler = require('../../compile')();
const { traverse, val } = require('../../../../stratc/ast');
const assert = require('assert');
const inherit = fileData => compiler(
  null,
  'inheritance',
  fileData,
  path.resolve(__dirname, './fileInput.st'));


const emptySource = `
source empty {}
`;
const sourceWithMatch = `
source matchSource {
  match ():any -> "./match.js"
}
`;
describe('inheritance', () => {
  it('should add match to a source that doesn\'t have a match fn', async () => {
    const result = await inherit(emptySource);
    const fnNamesSet = traverse(result, ['file', 'source', 'body', 'function', 'functionName'])
      .map(fnName => val(fnName, 'name'))
      .constantMapping(true);
    assert(fnNamesSet['match']);
    assert(fnNamesSet['emit']);
  });
  it('added match function should point to stdMatch.js', async () => {
    const result = await inherit(emptySource);
    const matchFn = traverse(result, ['file', 'source', 'body', 'function'])
      .filter(fn => val(traverse(fn, ['functionName'])[0], 'name') === 'match')
      [0];
    assert(path.basename(matchFn.artifact.absolutePath) === 'stdMatch.js');
  });
  it('shoudlnt overwrite existing match', async () => {
    const result = await inherit(sourceWithMatch);
    const matchFn = traverse(result, ['file', 'source', 'body', 'function'])
      .filter(fn => val(traverse(fn, ['functionName'])[0], 'name') === 'match')
      [0];
    assert(path.basename(matchFn.artifact.absolutePath) === 'match.js');
  });
});
