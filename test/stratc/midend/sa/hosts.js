const path = require('path');
const compiler = require('../../compile')();
const assert = require('assert');
const hosts = fileData => compiler(
  null,
  'hosts',
  fileData,
  path.resolve(__dirname, './fileInput.st'));
const { traverse } = require('../../../../stratc/ast');

const emptyService = `
service X {}
`;

const emptySource = `
source X {}
`;

const externSource = `
source X {
  Extern -> foo ():any -> "foo"
}
service Y {}
`;

describe('hosts', () => {
  // it('something', async () => {
  //   const result = await hosts(externSource);
  //   console.log(result.subscribers)
  //   console.log(JSON.stringify(result.hosts, null, 2));
  // });
});
