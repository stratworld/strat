module.exports = function (event, context, callback) {
  respond(handler, event, callback);
}

/*
Hosts respond to requests using a map with these properties:
[data, componentRejection, componentFailure, systemRejection, systemFailure]

data: Execution finished normally
componentRejection: Execution finished normally with a rejected promise
componentFailure: Execution aborted with an exception
systemRejection: The host is not configured properly and cannot handle the event
systemFailure: The host failed in executing the handler
*/
function respond (event, cb) {
  const workDoing = work();
  if (typeof workDoing.then === 'function') {
    workDoing
      .then(result => cb(null, result));
  } else {
    cb(null, workDoing);
  }

  function work () {
    try {
      const config = require('./config.json');
      require('./resolver');
    } catch (e) {
      return {
        systemFailure: {
          message: 'Failed to initialize the Lit host.',
          error: e
        }
      };
    }

    var handler;
    try {
      handler = require(config.handlerPath);
    } catch (e) {
      if (e.message === `Cannot find module '${config.handlerPath}'`) {
        return {
          systemRejection: {
            message: `Could not find handler module ${config.handlerPath}`,
            error: `Could not find handler module ${config.handlerPath}`
          }
        };
      }
      return {
        componentFailure: {
          message: 'Failed while requiring component',
          error: e
        }
      };
    }

    if (typeof handler !== function) {
      return {
        systemRejection: {
          message: 'Handler is not a function',
          error: `The handler exported by ${config.handlerPath} is not a function`
        }
      };
    }

    const argument = getArg(event);

    try {
      const promise = handler(argument);
      if (typeof promise !== 'object' || typeof promise.then !== 'function') {
        return {
          data: promise
        };
      }
      promise
        .then(result => Promise.resolve({
          data: result
        }))
        .catch(e => Promise.resolve({
          componentRejection: {
            message: `Executing ${config.handlerPath} rejected`,
            error: e
          }
        }));
    } catch (e) {
      return {
        componentFailure: {
          message: `Unhandled exception while executing ${config.handlerPath}`,
          error: e
        }
      };
    }
  }
}

function getArg (event) {
  if (typeof event !== 'object' || event.hostTransport === undefined) {
    // if its not a host-host communication, assume its an event from
    // an event source library and pass it along unchanged
    return event;
  }
  return event.data;
}
