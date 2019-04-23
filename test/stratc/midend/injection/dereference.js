const path = require('path');
const compiler = require('../../compile')();
const { traverse, val } = require('../../../../stratc/ast');
const assert = require('assert');
const dereference = fileData => compiler(
  null,
  'dereference',
  fileData,
  path.resolve(__dirname, './fileInput.st'));

const simpleRef = `
service X {
  foo ():any -> "foo"
}

service Y {
  include "Birth"
  Birth -> X.foo
}
`;

describe('dereference', () => {
  it('should inject a proxy function into Y', async () => {
    const result = await dereference(simpleRef);
    const dispatch = traverse(result,
      ['file', 'service', 'body', 'dispatch'])
      [0]

    assert(dispatch.reference === undefined);
    assert(val(dispatch.functionName[0], 'name').indexOf('anonymous') === 0);
  });
});
