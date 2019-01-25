const proxyFunctionFactory = require('./proxyFunction');
const ast = require("../../ast");
const AST = ast.build;
const stdPath = require('path');
const traverse = ast.traverse;
const line = ast.line;
const val = ast.val;
const kvpsToMap = ast.kvpsToMap;
const getConfig = ast.getConfig;
const resolveFunction = ast.resolveFunction;

const functionFinder = require('./functionFinder');
module.exports = function (dependencies) {
  return functionFinder;
  //return includes;
}

function includes (ast) {
  const filesWithSource = getFilesWithSource(ast);
  if (filesWithSource.length === 0) return ast;
  const eventIncluders = filesWithSource.reduce((lookup, nextFileWithSource) => {
    const sourceName = val(traverse(nextFileWithSource, ['source'])[0], 'name');
    lookup[sourceName] = getIncluder(nextFileWithSource);
    return lookup;
  }, {});
  const filesWithServices = getFilesWithService(ast);

  return Promise.all(filesWithServices.map(file => {
    const service = traverse(file, ['service'])[0];
    const bundles = getBundles(service, ast);
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
            .then(newArtifactBuffer => R({
              data: newArtifactBuffer,
              eventName: eventName
            }))
            .catch(error)
        } catch (e) {
          return error(e);
        }
        
      }))
      .then(newArtifacts =>
        addFunctionsIntoService(service, newArtifacts));
  }))
  .then(() => R(ast));
};

// This mutates the service by:
//  removing all dispatches
//  adding proxy functions that call the artifacts the libraries built
function addFunctionsIntoService (service, newArtifacts) {
  const newFunctions = newArtifacts.map(proxyFunctionFactory)
    .concat(traverse(service, ['dispatch', 'function']))
    .concat(traverse(service, ['function']));
  const events = traverse(service, ['dispatch', 'event']);

  delete service.dispatch;
  delete service.function;

  service.function = newFunctions;
  service.event = events;
  return R();
}

function getFilesWithSource (ast) {
  return getFilesWithX(ast, 'source');
}

function getFilesWithService (ast) {
  return getFilesWithX(ast, 'service');
}

function getFilesWithX (ast, X) {
  return traverse(ast, ['file'])
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
function getBundles (service, program) {
  return traverse(service, ['dispatch'])
    .reduce((bundles, dispatch) => {
      //this takes the first event; there could be more than one
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
