module.exports = deps => async ir => {
  ir.hosts.pairs().forEach(async kvp => {
    const hostName = kvp[0];
    const host = kvp[1];
    host.artifacts.push(getConfigArtifact(hostName, host, ir.subscribers));
  });

  return ir;
};

function getConfigArtifact (hostName, host, subscribers) {
  return {
    name: `${hostName}.majordomoConfig`,
    token: {
      value: wrapInfo({
        extern: getExtern(host.artifacts, subscribers),
        birth: getBirth(host.artifacts, subscribers),
        inScope: host.inScope
      }),
      line: 0,
      type: 'STRING'
    },
    declaredFile: './stub.js',
    absolutePath: false,
    type: 'text',
    media: '.js'
  };
}

function getExtern(artifacts, subscribers) {
  const artifactNames = artifacts.toMap(v => true, a => a.name);
  return (subscribers.Extern || [])
    .map(birthDispatch => birthDispatch.reference)
    .filter(ref => artifactNames[ref])[0];
}

function getBirth(artifacts, subscribers) {
  const artifactNames = artifacts.toMap(v => true, a => a.name);
  return (subscribers.Birth || [])
    .map(birthDispatch => birthDispatch.reference)
    .filter(ref => artifactNames[ref]);
}

function wrapInfo (info) {
  return `const d = JSON.parse('${JSON.stringify(info)}');module.exports = () => d;`;
}
