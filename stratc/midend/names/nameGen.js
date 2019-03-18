const { traverse, val, kvpsToMap, build } = require('../../ast');

module.exports = (deps) => gen;

// generate a name for unnamed resource dispatches
// this is needed by libinclude proxy functions
function gen (ast) {
  const dispatches = traverse(ast, ['file', 'service', 'dispatch']);

  dispatches
    .filter(dispatch => dispatch.functionName === undefined)
    .forEach(generateName)

  return ast;
}

function generateName (dispatch) {
  const firstEvent = traverse(dispatch, ['event'])[0];
  const eventName = val(firstEvent, 'name');
  const eventConfig = kvpsToMap(traverse(dispatch, ['event', 'kvp']));

  const nameHash = {
    name: eventName,
    config: eventConfig
  }.hash();
  const name = `anonymousResource#${nameHash.substr(0,8)}`;

  dispatch.functionName = [nameAst(name)];
}

function nameAst (name) {
  return build('functionName', {
    name: {
      value: name,
      line: 0
    }
  });
}