const path = require('path');
const compiler = require('../../compile')();
const assert = require('assert');
const scope = fileData => compiler(
  null,
  'scope',
  fileData,
  path.resolve(__dirname, './fileInput.st'));
const { traverse } = require('../../../../stratc/ast');
const fileDrivenTests = require('../../../util/fileDrivenTests');


const simpleService = `
service Foo {}
`;

const simpleFile = `
service Foo {}
service Bar {}
service Baz {}
`;

const includeCase = {
  name: "should include containers in included files",
  files: {
    'entry.st': `
service Entry {
  include "./Other.st"
}`,
    'Other.st': `
service Other {}
`
  },
  entry: 'entry.st',
  assertion: (ast, done) => {
    assert.deepStrictEqual(ast.scopes.Other, {Other:true})
    assert.deepStrictEqual(ast.scopes.Entry, {Other:true, Entry:true})
    done();
  }
}

describe('scopes', () => {
  it('should create a scope for even an empty service', async () => {
    const result = await scope(simpleService);
    assert.deepStrictEqual(result.scopes.Foo, {Foo: true});
  });
  it('should include containers in the same file', async () => {
    const result = await scope(simpleFile);
    assert.deepStrictEqual(result.scopes.Foo, {Foo: true, Bar: true, Baz: true});
  });
  fileDrivenTests([includeCase], 'scope');
});
