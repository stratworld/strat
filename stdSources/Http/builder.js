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
    })
  // getTree((httpEvents || [])
  //   .map(split)
  //   .sort(pathLength));
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
  '.json': 'application/json'
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

// function getTree (paths) {
//   var i = 0, c = 0;
//   const root = {};
//   var focus;
//   var path, chunk;
//   for(; i < paths.length; i++) {
//     path = paths[i];
//     focus = root;
//     c = 0;
//     for(; c < path.chunks.length; c++ /*heh*/) {
//       chunk = path.chunks[c];
//       if (focus.children === undefined) {
//         focus.children = {};
//       }
//       if (focus.children[chunk] === undefined) {
//         focus.children[chunk] = {};
//       }
//       focus = focus.children[chunk];
//     }
//     focus.methods = Object.assign(
//       (focus.methods || {}),
//       {
//         [path.method]: {
//           name: path.functionName,
//           headers: getHeaders(path.artifact, path.isResource)
//         }
//       });
//   }

//   return root;
// }

function getHeaders (fileName, isResource) {
  if (!isResource) {
    return {
      "Content-Type": "application/json"
    };
  }
  const extension = stdPath.extname(fileName);
  return {
    'Content-Type': (contentTypes[extension] || contentTypes['.js'])
  };
}

// function split (event) {
//   return {
//     functionName: event.functionName,
//     artifact: event.artifact,
//     isResource: event.isResource,
//     method: (event.eventConfig.method || '').toLowerCase(),
//     chunks: chunk(event.eventConfig.path)
//   };
// }

// function chunk (pathString) {
//   return pathString
//       .split("/")
//       .filter(chunk => chunk !== '');
// }

// function pathLength (A, B) {
//   return A.chunks.length - B.chunks.length;
// }
