const path = require('path');
const compiler = require('../../compile')();
const { traverse, val } = require('../../../../stratc/ast');
const assert = require('assert');
const majordomo = fileData => compiler(
  null,
  'majordomo',
  fileData,
  path.resolve(__dirname, './fileInput.st'));

const helloWorld = `
service X {
  include "Http"
  include "Birth"
  Http {method: "get", path: "*"} -> "HelloWorld"
  Birth -> "foo"
}
`;

describe('majordomo', () => {
  // it('something', async () => {
  //   const result = await majordomo(helloWorld);
  //   // C(result.hosts)
  // })
  it('something');
});