const regexMatcher = require('path-to-regexp');

module.exports = match => {
  const req = match.event;
  if (!isNaN(parseInt(match.pattern))) {
    return matchError(parseInt(match.pattern), req);
  }
  if (match.pattern === 'any'
    || (match.pattern == 404 && match.event == 404)) {
    return {
      matched: true,
      event: req
    };
  }
  const pattern = validatePattern(match.pattern);

  if (checkMethod(pattern.method, req.method)) {
    const params = checkPath(pattern.path, req.path);
    if (typeof params === 'object') {
      req.params = params;
      return {
        matched: true,
        event: req
      };
    }
  }
  return {
    matched: false,
    event: match.event
  };
};

function matchError (statusPattern, errObj) {
  if (statusPattern == errObj.status) {
    return {
      matched: true,
      event: errObj
    }
  }
  return {
    matched: false,
    event: errObj
  };
}

function validatePattern (pattern) {
  if (pattern === undefined
    || typeof pattern !== 'object'
    || typeof pattern.method !== 'string'
    || typeof pattern.path !== 'string') {
    throw new Error(`Invalid Http pattern.  Http patterns must be an object with string path and string method properties.
Invalid pattern: ${serializeErrorPattern(pattern)}`);
  }
  return pattern;
}

function serializeErrorPattern (pattern) {
  if (typeof pattern === 'object') {
    return JSON.stringify(pattern, null, 2);
  }
  return pattern.toString();
}

// returns undefined if no match; params object if match
function checkPath (pathPattern, path) {
  const keys = [];
  const cleanedPathPattern = pathPattern
    .replace(/\*/g, '(.*)')
    .replace(/\/$/g, '');
  const re = regexMatcher(cleanedPathPattern, keys);
  const match = re.exec(path);
  if (match === null) {
    return undefined;
  }
  var i = 0;
  const params = {};
  for (; i < keys.length; i++) {
    // this jacked up api...
    if (pathPattern.indexOf(`:${keys[i].name}`) > -1) {
      params[keys[i].name] = match[i + 1];
    }
  }
  return params;
}

function checkMethod (methodPattern, method) {
  if (methodPattern === '*' || methodPattern === 'any') {
    return true;
  }

  const permittedMethods = new Set(methodPattern
    .split('|')
    .map(m => (m || '').toLowerCase().trim()));

  return permittedMethods.has(method);
}
