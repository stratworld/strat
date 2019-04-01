const Strat = require('strat');
module.exports = function (event) {
  const method = event.httpMethod;
  const path = event.path;

  const matchedPaths = [];
  tree.forEach(branch => {
    const keys = [];
    const cleanedPath = branch.path
      .replace(/\*/g, '(.*)')
      .replace(/\/$/g, '');
    const re = pathToRegexp(cleanedPath, keys);
    const match = re.exec(path);
    if (match !== null) {
      var i = 0;
      const params = {};
      for (; i < keys.length; i++) {
        // this jacked up api...
        if (branch.path.indexOf(`:${keys[i].name}`) > -1) {
          params[keys[i].name] = match[i + 1];
        }
      }
      matchedPaths.push({
        branch: branch,
        params: params
      });
    }
  });

  if (matchedPaths.length === 0) {
    return Promise.resolve({
      statusCode: 404,
      isBase64Encoded: false,
      headers: {},
      body: 'not found'
    });
  }

  const matchedMethod = matchedPaths
    .filter(matchWithBranch => matchWithBranch.branch.method.toLowerCase()
      === method.toLowerCase())
    [0];

  if (matchedMethod === undefined) {
    return Promise.resolve({
      statusCode: 405,
      isBase64Encoded: false,
      headers: {},
      body: 'method not allowed'
    });
  }

  var body = undefined;
  try {
    body = method === 'get' || event.body === undefined
      ? undefined
      : JSON.parse(event.body);
  } catch (e) {
    return Promise.resolve({
      statusCode: 400,
      headers: {},
      isBase64Encoded: false,
      body: `invalid json input: ${e}
Bad json: ${event.body}`
    });
  }

  return Strat(matchedMethod.branch.function)({
    body: body,
    params: matchedMethod.params
  })
  .then(response => {
    const contentType = (matchedMethod.branch.headers
      || {})["Content-Type"];
    var body = contentType === 'application/json'
        ? JSON.stringify(response)
        : response;
    body = apiGatewayHack(event, body, contentType);
    return Promise.resolve({
      statusCode: 200,
      headers: matchedMethod.branch.headers,
      isBase64Encoded: false,
      body: body,
    })
  })
  .catch(e => {
    const errorText = e.stack === undefined
      ? e
      : e.stack;
    return Promise.resolve({
      statusCode: 500,
      headers: {},
      isBase64Encoded: false,
      body: errorText
    })
  });
};

/*
  AWS APIGateway's development stages insert the stage name as
  a path section.  EX: .execute-api.us-west-2.amazonaws.com/Client

  This is hell and completely breaks html imports like:
    <link rel="stylesheet" type="text/css" href="root.css">

  I have figured out two workarounds for this:
    A) duplicate every html import and deal with the 403s:
      1) <link rel="stylesheet" type="text/css" href="root.css">
      2) <link rel="stylesheet" type="text/css" href="Client/root.css">
    B) rewrite the html to include a base href 

  This is a function that does B.  Its awful and I hate it.
*/
function apiGatewayHack (event, body, contentType) {
  if (contentType !== 'text/html'
    || event === undefined
    || event.requestContext === undefined
    || event.path === event.requestContext.path) {
    return body;
  }
  return body.replace('<head>', `<head><base href="https://${event.requestContext.domainName}${event.requestContext.path}/">`);
}
