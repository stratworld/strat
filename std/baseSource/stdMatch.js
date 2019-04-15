module.exports = function match ({ event, pattern }) {
  const no = { matched: false, event: event };
  const yes = { matched: true, event: event };

  if (pattern === undefined) return yes;

  if (pattern === 'any') return yes;

  //since we only have the any type this is fine
  if (Array.isArray(event) && Array.isArray(pattern)) return yes;

  // javascript take the wheel
  // wait no!  Javascript is a terrible driver!
  if (event == pattern) return yes;

  if (typeof event === 'object' && typeof pattern === 'object') {
    return recurseMatch(Object.keys(pattern).map(key => [event[key], pattern[key]]));
  }

  return no;
};

function recurseMatch (arrayOfProps) {
  var propMatch, i = 0, length = arrayOfProps.length;
  for (; i<length; i++) {
    propMatch = match({
      event: arrayOfProps[0],
      pattern: arrayOfProps[1]
    });
    if (propMatch.matched === false) return propMatch
  }
  return propMatch;
}
