const buildProxyArtifact = require('./buildProxyArtifact');
const stdPath = require('path');
module.exports = function (httpEvents) {
  try {
    checkEvents((httpEvents || []));
  } catch(e) {
    return J(e);
  }
  const tree = (httpEvents || [])
    .map(event => {
      return {
        function: event.functionName,
        method: event.eventConfig.method,
        path: event.eventConfig.path,
        headers: getHeaders(event.artifact, event.isResource)
      }
    });
  return buildProxyArtifact(tree);
}

const allowedMethods = {
  'get': true,
  'post': true,
  'put': true,
  'delete': true
};

const contentTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain'
};

// Http events must have: method, path
// path + method must be unique
// method must be get|post|put|delete
function checkEvents (events) {
  const incompleteEvents = events
    .filter(event => (event.eventConfig.method === undefined)
      || (event.eventConfig.path === undefined));
  if (incompleteEvents.length > 0) {
    // todo: throw better errors here
    // probably have to change the API to handle one event at a time
    // so that the compiler knows which one the library blew up on
    throw `Http events must have both method and path`;
  }

  events
    .map(event =>
      `${event.eventConfig.method.toLowerCase()}@${event.eventConfig.path}`)
    .reduce((existingEvents, nextEvent) => {
      if (existingEvents[nextEvent]) {
        throw `${nextEvent} has already been declared`;
      }
      existingEvents[nextEvent] = true;
      return existingEvents;
    }, {});

  const invalidMethods = events
    .filter(event => !allowedMethods[event.eventConfig.method.toLowerCase()]);
  if (invalidMethods.length > 0) {
    throw `${invalidMethods[0].eventConfig.method} is not a valid method.`;
  }
}

function getHeaders (artifact, isResource) {
  if (!isResource) {
    return {
      "Content-Type": "application/json"
    };
  }
  const extension = artifact.type;

  return {
    'Content-Type': (contentTypes[extension] || contentTypes['.js'])
  };
}
