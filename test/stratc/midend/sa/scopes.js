const path = require('path');
const compiler = require('../../compile')();
const assert = require('assert');
const scope = fileData => compiler(
  null,
  'scope',
  fileData,
  path.resolve(__dirname, './fileInput.st'));
const { traverse, val } = require('../../../../stratc/ast');
const fileDrivenTests = require('../../../util/fileDrivenTests');


const simpleService = `
service Foo {}
`;

const simpleFile = `
service Foo {}
service Bar {}
service Baz {}
`;

const httpInclude= `
service X {
  include "Http"
  Http -> foo ():any -> "foo"
}
`;

const externInclude = `
serivce X {
  Birth -> "foo"
}
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
};

describe('scopes', () => {
  it('should create a scope for even an empty service', async () => {
    const result = await scope(simpleService);
    assert.deepStrictEqual(result.scopes.Foo, {Foo: true});
  });
  it('should include containers in the same file', async () => {
    const result = await scope(simpleFile);
    assert.deepStrictEqual(result.scopes.Foo, {Foo: true, Bar: true, Baz: true});
  });
  it('should allow http to call X', async () => {
    const result = await scope(httpInclude);
    assert(result.scopes.Http.X);
  });
  it('should not allow X to call Http', async () => {
    const result = await scope(httpInclude);
    assert(result.scopes.X.Http === undefined);
  });
  it('should not add SUBSTRATE to Http', async () => {
    const result = await scope(httpInclude);
    assert(result.scopes.Http.SUBSTRATE === undefined);
  });
  it('should remove Extern and Birth sources from the ast', async () => {
    const result = await scope(httpInclude);
    const birth = traverse(result, ['file', 'source'])
      .filter(source => val(source, 'name') === 'Birth')
      [0];
    assert(birth === undefined);
  });
  it('should add the reflexive scope to soures', async () => {
    const result = await scope(httpInclude);
    assert(result.scopes.Http.Http);
  })
  fileDrivenTests([includeCase], 'scope');
});
