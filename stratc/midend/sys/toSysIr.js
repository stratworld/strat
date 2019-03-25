const stdPath = require('path');
const {
  val, line, resolve, traverse, getConfig, kvpsToMap
} = require("../../ast");

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
            artifacts: [
              {
                declaration: {
                  path: path,
                  name: val(traverse(fn, ['functionName'])[0], 'name'),
                  service: serviceName
                },
                scope: serviceName,
                name: name(service, fn),
                ...fn.artifact
              }
            ],
            events: getProxyEvents(proxyNameLookup, fnName)
          }
        })
    })
}
/*
A function is in scope for a function declared inside service A if:
  1) it is also declared within service A
  2) it is declared in the same file in another service
  3) it is declared in services in files included in service A

The objective of this function is to generate the scope lookup:
  {
    scopeName: {
      functionName: true
    } 
  }
*/
function getScopes (ast) {
  const filePathsToBaseScopes = traverse(ast, ['file'])
    .reduce((lookup, file) => {
      const services = traverse(file, ['service']);
      const baseScopeForFile = services
        .flatmap(getFunctionNamesFromService);
      lookup[val(file, 'path')] = baseScopeForFile;
      return lookup;
    }, {});

  return traverse(ast, ['file'])
    .flatmap(file => traverse(file, ['service'])
      .map(service => [val(file, 'path'), service]))
    .map(filePathAndService => {
      const baseScope = filePathsToBaseScopes[filePathAndService[0]];
      const service = filePathAndService[1];
      const includedScopes = traverse(service, ['include'])
        .flatmap(include => filePathsToBaseScopes[val(include, 'path')])
        // in the case where we codegen an import (public keyword) there
        // is no included file, so we remove them here
        .purge();
      return [val(service, 'name'), baseScope.concat(includedScopes)];
    })
    .reduce((allScopes, serviceScope) => {
      allScopes[serviceScope[0]] = serviceScope[1]
        .constantMapping(true);
      return allScopes;
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
  if (fnName.indexOf('strat_generated_proxy') === -1) {
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
      stratCode: 'E_UNSUPPORTED_RUNTIME',
      msg: `Function ${val(fn, 'name')} can't be executed--only artifacts with a ".js" extension can be executed`,
      file: path,
      line: fnLine
    };
}

function getFunctionNamesFromService (service) {
  return traverse(service, ['function'])
    .map(fn => name(service, fn));
}
