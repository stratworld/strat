const stdPath = require('path');
const ast = require("../../ast");
const val = ast.val;
const line = ast.line;
const resolve = ast.resolve;
const traverse = ast.traverse;
const getConfig = ast.getConfig;

module.exports = function (ir) {
  return R({
    id: val(ir, 'id'),
    hosts: getHosts(ir),
    scopes: getScopes(ir)
  });
}

function getHosts (ir) {
  return traverse(ir, ['file'])
    .flatmap(file => traverse(file, ['service'])
      .map(service => [val(file, 'path'), service]))
    .flatmap(pathAndServiceTuple => {
      const path = pathAndServiceTuple[0];
      const service = pathAndServiceTuple[1];
      const serviceName = val(service, 'name');

      return traverse(service, ['function'])
        .map(fn => {
          return {
            name: name(service, fn),
            runtime: (isFunctionResource(fn)
              ? undefined
              : getRuntime(fn, path)),
            scope: serviceName,
            artifacts: [
              {
                name: name(service, fn),
                ...fn.artifact
              }
            ]
          }
        })
    })
}

function getScopes (ir) {
  return traverse(ir, ['file', 'service'])
    .reduce((scopes, service) => {
      const serviceName = val(service, 'name');
      const declaredFunctions = traverse(service, ['function'])
        .map(fn => name(serviceName, fn));
      const includedFunctions = resolve(ir, traverse(service, ['include']))
        .flatmap(resolvedFile => traverse(resolvedFile, ['service']))
        .flatmap(service => traverse(service, ['function'])
          .map(fn => name(service, fn)))

      scopes[serviceName] = declaredFunctions
        .concat(includedFunctions)
        .constantMapping(true);
      return scopes;
    }, {});
}

function name (service, fn) {
  const serviceName = typeof service === 'string'
    ? service
    : val(service, 'name');
  const fnName = typeof fn === 'string'
    ? fn
    : val(fn, 'name');
  return `${serviceName}-${fnName}`;
}

function isFunctionResource (fn) {
  return traverse(fn, ['shape']).length < 2;
}

function getRuntime (fn, path) {
  if (fn.artifact.type === '.js');
    return "node";
  throw {
      error: 'Invalid function',
      msg: `${path} line ${fnLine}
Function ${val(fn, 'name')} can't be executed--only artifacts with a ".js" extension can be executed`
    };
}
