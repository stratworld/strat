/*global Lit*/
const config = require('./config.json');


// returns a function that will invoke the named Lit artifact
const litHelpText = {
  error: "Pass an absolute function name into Lit. Ex: Lit('Books-getBooks')"
};
Lit = function (functionName) {
  if (typeof functionName !== 'string') {
    throw litHelpText;
  }
  const tokens = functionName.split('-');
  if (tokens.length !== 2) {
    throw litHelpText;
  }
  return resolve(functionName);
};

const handler = require(config.handlerPath);

/*
todo: refactor this into something more coherent

successful events are of the form:
{
  valuePresent: boolean,
  value: objectOrWhatever
}

failures are:
{
  __LE: true,
  error: error
}

*/

module.exports = function (event, context, callback) {
  const argument = event.valuePresent
    ? event.value
    : undefined;
  // branch on if its a http request proxy or a lit sourced event
  handler((event.httpMethod !== undefined
    ? event
    : argument))
  .then(result => {
    callback(null, result);
  })
  .catch(error => {
    callback(null, {
      __LE: true,
      error: error
    });
  });
}

function resolve (functionName) {
  const resolution = config.scope[functionName];
  if (resolution === undefined) {
    throw {
      error: `${functionName} is not defined in the current scope.`
    };
  }

  var infrastructureLayer;
  switch (resolution.service) {
    case 'lambda':
      infrastructureLayer = './functionDependency';
      break;
    case 's3':
      infrastructureLayer = './resourceDependency';
      break;
    default:
      throw {
        error: `Could not resolve dependency of type ${resolution.service}`
      };
  }
  return require(infrastructureLayer)(resolution);
}
