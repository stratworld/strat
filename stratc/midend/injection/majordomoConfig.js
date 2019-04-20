module.exports = deps => async ir => {
  ir.hosts.values().forEach(async host => {
    host.artifacts.push(getConfigArtifact(host, ir.subscribers));
  });

  return ir;
};

function getConfigArtifact (host, subscribers) {
  return {
    name: "MAJORDOMO.CONFIG",
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
  return `module.exports = () => JSON.parse('${JSON.stringify(info)}');`;
}
