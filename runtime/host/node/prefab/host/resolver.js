const scope = require('./config.json').scope;
const failures = [
  'componentRejection',
  'componentFailure',
  'serviceRejection',
  'serviceFailure'
];

Lit = function (functionName) {
  if (typeof functionName !== 'string' || functionName.length === 0) {
    throw "Pass an absolute function name into Lit. Ex: Lit('Books-getBooks')";;
  }
  return resolve(functionName);
};

function resolve (functionName) {
  const resolution = config.scope[functionName];
  if (resolution === undefined) {
    throw `${functionName} is not defined in the current scope.`;
  }
  const transport = require(resolution.invoke);

  return function (arg) {
    //todo: compose this
    return transport({
      data: arg
    }).then(result => {
      const failure = failures
        .filter(failure => result[failure] !== undefined)
        .map(failure => result[failure])
        [0];

      if (failure !== undefined) {
        return Promise.reject(failure);
      }
      return Promise.resolve(result.data);
    });
  }
}

