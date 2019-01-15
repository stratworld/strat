const scope = require('./config.json').scope;

const failures = [
  'componentRejection',
  'componentFailure',
  'serviceRejection',
  'serviceFailure'
];

module.exports = function (functionName) {
  if (typeof functionName !== 'string' || functionName.length === 0) {
    throw "Pass an absolute function name into Lit. Ex: Lit('Books-getBooks')";;
  }

  const resolution = scope[functionName];
  if (resolution === undefined) {
    throw `${functionName} is not defined in the current scope.`;
  }

  //todo: check if this is on-host, then use local transport
  const transport = require(resolution.invoke)(resolution.config);
  return function (arg) {
    //todo: compose this
    return transport({
      callee: functionName,
      data: arg
    }).then(result => {
      const failure = failures
        .filter(failure => result[failure] !== undefined)
        .map(failure => result[failure])
        [0];

      if (failure !== undefined) {
        return Promise.reject(failure);
      }
      return result.data;
    });
  }
}
