const {traverse, getName, val} = require('../../ast');

module.exports = deps => ast => {
  const hosts = ast.scopes.keys()
    .constantMapping({
      containers: {},
      inScope: {},
      artifacts: []
    });

  const reflectFns = {};

  traverse(ast, ['file', 'service|source'])
    .flatmap(container => traverse(container, ['body', 'function'])
      .map(fn => [getName(container), fn]))
    .forEach(containerFnTuple => {
      const containerName = containerFnTuple[0];
      const fnAst = containerFnTuple[1];
      const targetHost = hosts[ast.movedScopes[containerName] || containerName];

      // dangerous javascript mutation bugs lurk here:
      // need to be careful to create new objects for the hosts
      targetHost.containers = Object.assign({
        [containerName]: true
      }, targetHost.containers);
      const artifact = getArtifact(fnAst, containerName);
      if (artifact.name.indexOf('.reflect') > -1) {
        reflectFns[containerName] = artifact;
      }
      targetHost.artifacts
        = targetHost.artifacts.concat(artifact);
    });

  hosts
    .pairs()
    .forEach(kvp => {
      const name = kvp[0];
      const host = kvp[1];
      host.inScope = ast.scopes[name];
      //todo: do something clever here?
      //like a checksum or something?
      host.id = val(ast, 'id');
      host.name = name;
      const reflectFnsToAdd = host.inScope
        .keys()
        .filter(containerName => !host.containers[containerName])
        .map(containerName => reflectFns[containerName]);
      host.artifacts = host.artifacts.concat(reflectFnsToAdd);
    });

  ast.hosts = hosts;
  return ast;
};

function getArtifact (fnAst, containerName) {
  const name
    = `${containerName}.${getName(traverse(fnAst, ['functionName'])[0])}`;
  return {
    name: name,
    ...fnAst.artifact
  }
}
