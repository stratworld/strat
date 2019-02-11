const stdPath = require('path');
const ast = require("../../ast");
const val = ast.val;
const line = ast.line;
const resolve = ast.resolve;
const traverse = ast.traverse;
const getConfig = ast.getConfig;
const kvpsToMap = ast.kvpsToMap;

module.exports = deps => ast => {
  return R({
    id: val(ast, 'id'),
    hosts: getHosts(ast),
    scopes: getScopes(ast)
  });
}

function getHosts (ast) {
  return traverse(ast, ['file'])
    .flatmap(file => traverse(file, ['service'])
      .map(service => [val(file, 'path'), service]))
    .flatmap(pathAndServiceTuple => {
      const path = pathAndServiceTuple[0];
      const service = pathAndServiceTuple[1];
      const serviceName = val(service, 'name');
      const proxyNameLookup = toProxyLookup(getEvents(service));

      return traverse(service, ['function'])
        .map(fn => {
          const fnName = name(service, fn);
          return {
            name: fnName,
            runtime: (isFunctionResource(fn)
              ? undefined
              : getRuntime(fn, path)),
            scope: serviceName,
            artifacts: [
              {
                name: name(service, fn),
                ...fn.artifact
              }
            ],
            events: getProxyEvents(proxyNameLookup, fnName)
          }
        })
    })
}

function getScopes (ast) {
  return traverse(ast, ['file', 'service'])
    .reduce((scopes, service) => {
      const serviceName = val(service, 'name');
      const declaredFunctions = traverse(service, ['function'])
        .map(fn => name(serviceName, fn));
      const includedFunctions = resolve(ast, traverse(service, ['include']))
        .flatmap(resolvedFile => traverse(resolvedFile, ['service']))
        .flatmap(service => traverse(service, ['function'])
          .map(fn => name(service, fn)))

      scopes[serviceName] = declaredFunctions
        .concat(includedFunctions)
        .constantMapping(true);
      return scopes;
    }, {});
}

function getEvents (service) {
  return traverse(service, ['event'])
    .map(cleanEvent)
    .reduce((typeLookup, nextEvent) => {
      if (typeLookup[nextEvent.type] === undefined) {
        typeLookup[nextEvent.type] = [];
      }
      typeLookup[nextEvent.type].push(nextEvent);
      return typeLookup;
    }, {});
}

function cleanEvent (event) {
  return {
    type: val(event, 'name'),
    ...kvpsToMap(event.kvp)
  };
}

function toProxyLookup (eventLookup) {
  return eventLookup.keys()
    .reduce((proxyLookup, nextKey) => {
      const newKey = `proxy_${nextKey}`;
      proxyLookup[newKey] = eventLookup[nextKey];
      return proxyLookup;
    }, {});
}

function getProxyEvents (proxyLookup, fnName) {
  if (fnName.indexOf('lit_generated_proxy') === -1) {
    return [];
  }
  return proxyLookup.keys()
    .filter(key => fnName.indexOf(key) > -1)
    .map(key => proxyLookup[key])
    [0];
}

function name (service, fn) {
  const serviceName = typeof service === 'string'
    ? service
    : val(service, 'name');
  const fnName = typeof fn === 'string'
    ? fn
    : val(traverse(fn, ['functionName'])[0], 'name');
  return `${serviceName}.${fnName}`;
}

function isFunctionResource (fn) {
  return traverse(fn, ['functionName', 'signature']).length === 0;
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
