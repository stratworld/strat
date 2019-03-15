module.exports = (pathOrIr, registry) => {
  if (typeof pathOrIr === 'string') {
    return runtimeStrat(pathOrIr);
  }
  return bootstrapStrat(pathOrIr, registry);
};

//this is going to assign state to this module
//Why? At runtime functions will call rquire('strat') and resolve
// this cached module.  We need to have some statefull module hold
// these registries and scope, so we do it here.
var ir;
var scopeLookup;
var registry;
function bootstrapStrat (injectedIr, reg) {
  registry = reg;
  ir = injectedIr;
  scopeLookup = ir.hosts
    .flatmap(host => host.artifacts
      .map(artifact => [host.scope, artifact.name]))
    .reduce((lookup, artifactTuple) => {
      lookup[artifactTuple[1]] = artifactTuple[0];
      return lookup;
    }, {});
}

function runtimeStrat (callerName) {
  return function (dependency) {
    const callerScope = scopeLookup[callerName];
    //todo: refine this; the 4th branch is a system failure not a user error
    if (callerScope === undefined
      || ir.scopes[callerScope] === undefined
      || ir.scopes[callerScope][dependency] === undefined
      || typeof registry[dependency] !== 'function') {
      throw `Could not resolve ${dependency} within scope for ${callerName}`;
    }

    return registry[dependency];
  }
};
