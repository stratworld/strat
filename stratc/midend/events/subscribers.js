//takes every dispatch, turns it into a function
//adds the subscribers property to the AST

const { traverse, val } = require('../../ast');

module.exports = deps => ast => {
  const allDispatchesWithContainerName = traverse(ast, ['file', 'service|source'])
    .flatmap(container => {
      const name = val(container, 'name');
      return traverse(container, ['body', 'dispatch'])
        .map(dispatch => [dispatch, name]);
    });

  const subscribers = allDispatchesWithContainerName
    .flatmap(dispatchTuple => {
      const dispatch = dispatchTuple[0];
      const dispatchName = val(traverse(dispatch, ['functionName'])[0], 'name');
      const reference = `${dispatchTuple[1]}.${dispatchName}`;
      return dispatch.event.map(event => [event, reference]);
    })
    .reduce((subscribers, nextEventTuple) => {
      const event = nextEventTuple[0];
      const reference = nextEventTuple[1];
      const eventName = val(event, 'name');
      const pattern = event.pattern;

      const subConfig = {
        //todo: make patterns cleaner / work
        pattern: pattern || getAnyPattern(),
        reference: reference
      };

      if (subscribers[eventName] === undefined) {
        subscribers[eventName] = [];
      }
      subscribers[eventName].push(subConfig);
      return subscribers;
    }, {});
  ast.subscribers = subscribers;
  return ast;
};

function getAnyPattern () {
  return 'any';
}
