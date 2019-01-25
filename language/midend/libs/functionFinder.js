// given an AST, find all the functions, group them:
// by service (a service encapsulates an "invocation" of a source)
//  by event type (none for no event type)
//    references will be included outside of their service

const ast = require('../../ast');
const traverse = ast.traverse;
const val = ast.val;
const kvpsToMap = ast.kvpsToMap;
const stdPath = require('path');

module.exports = function (ast) {
  const x = getServices(ast)
     .map(sourceMapping);

    console.log(x)
     
  return {};
};

// function name is prefixed by the service
// generated function names must be greater scope than this file

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
      .flatmap(getFunctionInfos)
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
function getFunctionInfos (dispatch) {
  const events = traverse(dispatch, ['event']);
  const functionName = traverse(dispatch, ['functionName'])[0];
  const functionInfo = {
    // references!!!!
    artifact: stdPath.basename(val(dispatch, 'artifact')),
    isResource: getIsResource(functionName),
    functionName: getName(functionName, events[0])
  };

  return events.map(event => Object.assign({
      eventName: getEventName(event),
      eventConfig: getEventConfig(event)
    }, functionInfo));
}

function getIsResource (functionNameAst) {
  return traverse(functionNameAst, ['signature'])[0] === undefined;
}

function getName (functionNameAst, eventAst) {
  if (functionNameAst === undefined) {
    //create a name from the eventAst
    //the event config + event name is unique per service
    return {
      name: getEventName(eventAst),
      config: getEventConfig(eventAst)
    }.hash();
  }
  return val(functionNameAst, 'name');
}

function getEventName (eventAst) {
  return val(eventAst, 'name');
}

function getEventConfig (eventAst) {
  return kvpsToMap(traverse(eventAst, ['kvp']));
}
