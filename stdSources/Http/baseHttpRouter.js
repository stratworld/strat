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
    return Promise.reject({
      statusCode: 400,
      headers: {},
      isBase64Encoded: false,
      body: `invalid json input: ${e}`
    });
  }

  return Strat(matchedMethod.branch.function)({
    body: body,
    params: matchedMethod.params
  })
  .then(response => {
    const body = (matchedMethod.branch.headers || {})
      ["Content-Type"] === 'application/json'
        ? JSON.stringify(response)
        : response;
    return Promise.resolve({
      statusCode: 200,
      headers: matchedMethod.branch.headers,
      isBase64Encoded: false,
      body: body,
    })
  })
  .catch(e => {
    return Promise.resolve({
      // if we didn't like it its a bad request!
      // could 500 here, but that's a little dramatic
      // its not me, its you!
      statusCode: 500,
      headers: {},
      isBase64Encoded: false,
      body: e.toString()
    })
  });
};
