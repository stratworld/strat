// given an AST, find all the functions, group them:
// by service (a service encapsulates an "invocation" of a source)
//  by event type (none for no event type)
//    references will be included outside of their service

const ast = require('../../ast');
const traverse = ast.traverse;
const val = ast.val;
const resolveFunction = ast.resolveFunction;
const kvpsToMap = ast.kvpsToMap;
const stdPath = require('path');

var moduleScopeAst;
module.exports = function (ast) {

  // woa, this is dangerous and lazy!
  // yes, but its a SYNCHRONOUS module so its OK!
  moduleScopeAst = ast;

  return getServices(ast)
     .map(sourceMapping);
};

function getServices (ast) {
  return traverse(ast, ['file', 'service']);
}

// take a service and produce
// { 'sourceName' => [ functions ]}
function sourceMapping (service) {
  const serviceName = val(service, 'name');
  return {
    service: serviceName,
    events: traverse(service, ['dispatch'])
      .flatmap(dispatch => getFunctionInfos(dispatch, serviceName))
      .reduce((lookup, nextFunction) => {
        if (lookup[nextFunction.eventName] === undefined) {
          lookup[nextFunction.eventName] = [];
        }
        lookup[nextFunction.eventName].push(nextFunction);
        return lookup;
      }, {})
  };
}

// returns an array
// A dispatch can have multiple events but only one function
// return an info for each event
function getFunctionInfos (dispatch, serviceName) {
  const events = traverse(dispatch, ['event']);
  const functionInfo = getFunctionInfo(dispatch, serviceName);

  return events.map(event => Object.assign({
      eventName: getEventName(event),
      eventConfig: getEventConfig(event)
    }, functionInfo));
}

function getFunctionInfo (functionAst, serviceName) {
  const reference = traverse(functionAst, ['reference'])[0];
  if (reference !== undefined) {
    return getReferenceInfo(
      val(reference, 'service'),
      val(reference, 'function'));
  }
  const functionNameAst = traverse(functionAst, ['functionName'])[0];
  return {
    artifact: functionAst.artifact,
    isResource: getIsResource(functionNameAst),
    functionName: qualifyFunctionName(
      serviceName,
      getName(functionNameAst))
  };
}

function getReferenceInfo (serviceName, functionName) {
  const functionAst = resolveFunction(
    moduleScopeAst,
    serviceName,
    functionName);
  const functionNameAst = traverse(functionAst, ['functionName'])[0];
  return {
    artifact: stdPath.basename(val(functionAst, 'artifact')),
    isResource: getIsResource(functionNameAst),
    functionName: qualifyFunctionName(
      serviceName,
      functionName)
  };
}

function qualifyFunctionName (serviceName, functionName) {
  return `${serviceName}.${functionName}`;
}

function getIsResource (functionNameAst) {
  return traverse(functionNameAst, ['signature'])[0] === undefined;
}

function getName (functionNameAst) {
  return val(functionNameAst, 'name');
}

function getEventName (eventAst) {
  return val(eventAst, 'name');
}

function getEventConfig (eventAst) {
  return kvpsToMap(traverse(eventAst, ['kvp']));
}
