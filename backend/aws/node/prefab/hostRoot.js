const config = require('./config.json');
const path = require('path');
const handlerPath = path.join(__dirname, '/service', config.handler);
const handler = require(handlerPath);

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

module.exports = {
  handler: function (event, context, callback) {
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
}
