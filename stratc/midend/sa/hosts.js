const {traverse, getName} = require('../../ast');

module.exports = deps => ast => {
  const hosts = ast.scopes.keys()
    .constantMapping({
      containers: {},
      inScope: {},
      artifacts: []
    });

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
      targetHost.artifacts
        = targetHost.artifacts.concat(getArtifact(fnAst, containerName));
    });

  //figure out what's in scope after moves
  hosts
    .pairs()
    .forEach(kvp => {
      const name = kvp[0];
      const host = kvp[1];

      const scope = ast.scopes[name];
      host.inScope = scope
        .keys()
        .map(key => ast.movedScopes[key] || key)
        .constantMapping(true);
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
