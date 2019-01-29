const ast = require("../../ast");
const stdPath = require('path');
const traverse = ast.traverse;
const val = ast.val;
const includerFinder = require('./includerFinder');
const functionFinder = require('./functionFinder');
const proxyFunctionFactory = require('./proxyFunction');

module.exports = function (dependencies) {
  return includes;
}

function includes (ast) {
  const includers = includerFinder(ast);
  const serviceEventBundles = functionFinder(ast);
  const serviceAstLookup = getServiceAstLookup(ast);

  return Promise.all(serviceEventBundles
    .map(serviceEventBundle =>
      executeIncluders(serviceEventBundle, includers)
        .then(proxyArtifacts => {
          addFunctionsIntoService(
            serviceAstLookup[serviceEventBundle.service],
            proxyArtifacts);
          return R();
        })))
    .then(() => R(ast));
}

/*
Example serviceEventBundle:
{
  "service": "Backend",
  "events": {
    "Http": [
      {
        "eventName": "Http",
        "eventConfig": {
          "method": "get",
          "path": "bleh"
        },
        "artifact": "index.js",
        "isResource": false,
        "functionName": "Other.other"
      }
    ]
  }
}
*/
function executeIncluders (serviceEventBundle, includers) {
  return Promise.all(serviceEventBundle.events
    .keys()
    .map(eventName => {

      const error = e => J({
        error: e,
        msg: `Failed to run ${eventName}.`
      });

      try {
        return includers[eventName](serviceEventBundle.events[eventName], serviceEventBundle.service)
          .then(proxyArtifactBuffer => {
            return {
              data: proxyArtifactBuffer,
              eventName: eventName
            };
          })
          .catch(e => error(e));
      } catch (e) {
        return error(e);
      }
    }));
}

// This mutates the service by:
//  removing all dispatches
//  adding proxy functions that call the artifacts the libraries built
function addFunctionsIntoService (serviceAst, newArtifacts) {
  const newFunctions = newArtifacts
    .map(proxyFunctionFactory)
    .concat(traverse(serviceAst, ['dispatch']))
    .concat(traverse(serviceAst, ['function']))
    .filter(fn => fn.reference === undefined);
  const events = traverse(serviceAst, ['dispatch', 'event']);

  newFunctions.forEach(fn => {
    fn.type = 'function';
    delete fn.event;
  });

  delete serviceAst.dispatch;
  delete serviceAst.function;

  serviceAst.function = newFunctions;
  serviceAst.event = events;
}

function getServiceAstLookup (ast) {
  return traverse(ast, ['file', 'service'])
    .reduce((lookup, nextService) => {
      const name = val(nextService, 'name');
      lookup[name] = nextService;
      return lookup;
    }, {});
}
