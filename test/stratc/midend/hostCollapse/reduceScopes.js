const path = require('path');
const compiler = require('../../compile')();
const assert = require('assert');
const reduceScopes = fileData => compiler(
  null,
  'reducescopes',
  fileData,
  path.resolve(__dirname, './fileInput.st'));
const { traverse } = require('../../../../stratc/ast');

const redundant = `
service X {}
service Y {}
`;

const stillRedundant = `
service X {}
service Y {
  include "Http" 

  Http -> "foo"
}
`;

const httpService = `
service X {
  include "Http"
  Http -> foo ():any -> "foo"
}
`;

describe('reduceScopes', () => {
  it('should remove redundant scope Y', async () => {
    const result = await reduceScopes(redundant);
    assert(result.scopes.keys().length === 1);
  });
  it('should still remove scope Y', async () => {
    const result = await reduceScopes(stillRedundant);
    assert(result.scopes['Y'] === undefined);
  });
  it('should mark Y as moved to X', async () => {
    const result = await reduceScopes(stillRedundant);
    assert(result.movedScopes['Y'] === 'X');
  });
  it('should preserve Http\'s scope', async () => {
    const result = await reduceScopes(httpService);
    assert(result.scopes.Http !== undefined);
  });
});
