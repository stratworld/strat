const path = require('path');
const compiler = require('../../compile')();
const { traverse, val } = require('../../../../stratc/ast');
const assert = require('assert');
const mConfig = fileData => compiler(
  null,
  'majordomoconfig',
  fileData,
  path.resolve(__dirname, './fileInput.st'));

function getConfigInfo (host) {
  const configArtifact = host.artifacts
    .filter(a => a.name.indexOf('majordomoConfig') > 0)[0];
  const mConfigString = configArtifact.token.value
    .replace(/.*JSON\.parse\('/, '')
    .replace(/'\);.*/, '');

  return JSON.parse(mConfigString);
}

const httpInclude = `
service X {
  include "Http"
  Http -> "foo"
}
`;

describe('majordomoConfig', () => {
  it('should add a majordomo config function', async () => {
    const result = await mConfig(httpInclude);
    assert(result.hosts.X.artifacts
      .filter(a => a.name === 'X.majordomoConfig')[0] !== undefined);
  });
  it('should have in scope information', async () => {
    const result = await mConfig(httpInclude);
    const xcfg = getConfigInfo(result.hosts.X);
    assert.deepStrictEqual(xcfg.inScope, {X:true});
    const httpcfg = getConfigInfo(result.hosts.Http);
    assert.deepStrictEqual(httpcfg.inScope, {X:true, Http:true});
  });
});