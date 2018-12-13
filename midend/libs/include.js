const proxyFunctionFactory = require('./proxyFunction');
const ast = require("../../ast");
const AST = ast.build;
const stdPath = require('path');
const traverse = ast.traverse;
const line = ast.line;
const val = ast.val;
const getConfig = ast.getConfig;
const resolveFunction = ast.resolveFunction;

module.exports = function (ir) {
  const filesWithSource = getFilesWithSource(ir);
  if (filesWithSource.length === 0) return ir;
  const eventIncluders = filesWithSource.reduce((lookup, nextFileWithSource) => {
    const sourceName = val(traverse(nextFileWithSource, ['source'])[0], 'name');
    lookup[sourceName] = getIncluder(nextFileWithSource);
    return lookup;
  }, {});
  const filesWithServices = getFilesWithService(ir);

  return Promise.all(filesWithServices.map(file => {
    const service = traverse(file, ['service'])[0];
    const bundles = getBundles(service, ir);
    return Promise.all(bundles.keys()
      .map(eventName => {

        const error = e => J({
          error: e,
          msg: `${val(file, 'path')}
Failed to run ${eventName}.`
        });

        // this is where we actually invoke the library
        // todo: way better error handling
        try {
          return eventIncluders[eventName](bundles[eventName], val(service, 'name'))
            .catch(error)
        } catch (e) {
          return error(e);
        }
        
      }))
      .then(newArtifacts => addFunctionsIntoService(service, newArtifacts
        .map(newArtifact => resolvePath(file, newArtifact))));
  }))
  .then(() => R(ir));
};

// This mutates the service by:
//  removing all dispatches
//  adding proxy functions that call the artifacts the libraries built
function addFunctionsIntoService (service, newArtifacts) {
  const newFunctions = newArtifacts.map(proxyFunctionFactory)
    .concat(traverse(service, ['dispatch', 'function']))
    .concat(traverse(service, ['function']));

  // DANGER ZONE
  delete service.dispatch;
  delete service.function;

  service.function = newFunctions;
  return R();
}

function getFilesWithSource (ir) {
  return getFilesWithX(ir, 'source');
}

function getFilesWithService (ir) {
  return getFilesWithX(ir, 'service');
}

function getFilesWithX (ir, X) {
  return traverse(ir, ['file'])
    .filter(file => traverse(file, [X]).length > 0);
}

function getIncluder (fileWithSource) {
  const fileWithSourcePath = val(fileWithSource, 'path');
  const source = traverse(fileWithSource, ['source'])[0];
  const artifactBuilder = getConfig(
    source,
    'artifactBuilder'
  );
  const nameLine = line(source, 'name');

  if (artifactBuilder === undefined) {
    throw {
      error: 'Invalid event source',
      msg: `${fileWithSourcePath} line ${nameLine}
Event sources must supply a 'artifactBuilder' key in their config.`
    };
  }
  const builder = requirePath(fileWithSource, artifactBuilder);
  if (typeof builder !== 'function') {
    throw {
      error: 'Invalid event source',
      msg: `${fileWithSourcePath} line ${nameLine}
Export of ${artifactBuilder.value} is not a function.`
    }
  }
  return builder;
}

function resolvePath (declaredFile, pathStr) {
  const parentDirectory = stdPath.dirname(val(declaredFile, 'path'));
  return !stdPath.isAbsolute(pathStr)
    ? stdPath.resolve(parentDirectory, pathStr)
    : pathStr;
}

function requirePath (declaredFile, pathToken) {
  const absolutePath = resolvePath(declaredFile, pathToken.value);
  try {
    return require(absolutePath);
  } catch (e) {
    throw {
      error: 'File not found',
      msg: `${val(declaredFile, 'path')} line ${pathToken.line}
Failed to load ${pathToken.value}
${e.stack}`
    }
  }
}

/*
A bundle:
{
  [eventName]: [
    {
      eventConfig: {...},
      functionName: STRING
    }
  ]
}
*/
// Assume one event and one function per dispatch
// Will probably change this in the future
function getBundles (service, program) {
  return traverse(service, ['dispatch'])
    .reduce((bundles, dispatch) => {
      const event = traverse(dispatch, ['event'])[0];
      const eventName = val(event, 'name');
      if (bundles[eventName] === undefined) {
        bundles[eventName] = [];
      }
      var functionName;
      var resolvedFunction;
      if (traverse(dispatch, ['function']).length === 1) {
        const fn = traverse(dispatch, ['function'])[0];
        functionName = `${val(service, 'name')}-${val(fn, 'name')}`;
        resolvedFunction = fn;
      } else {
        const reference = traverse(dispatch, ['reference'])[0];
        functionName = `${val(reference, 'service')}-${val(reference, 'function')}`;
        resolvedFunction = resolveFunction(program, functionName);
      }
      const artifact = getConfig(resolvedFunction, 'artifact').value;
      bundles[eventName].push({
        eventConfig: kvpsToMap(traverse(event, ['kvp'])),
        functionName: functionName,
        artifact: artifact,
        isResource: traverse(resolvedFunction, ['shape']).length < 2
      });

      return bundles;
    }, {});
}

function kvpsToMap (kvps = []) {
  return kvps
    .reduce((map, kvp) => {
      map[val(kvp, 'key')] = val(kvp, 'value');
      return map;
    }, {});
}
