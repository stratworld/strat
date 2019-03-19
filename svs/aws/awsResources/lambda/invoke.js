const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const invoke = require('util').promisify(lambda.invoke.bind(lambda));

module.exports = function (config) {
  return function callLambda (payload) {
    const params = {
      InvocationType: 'RequestResponse',
      FunctionName: config.FunctionName
    };

    params.Payload = Buffer.from(JSON.stringify(payload));

    return invoke(params)
      .then(r => {
        return JSON.parse(r.Payload);
      });
  }
}

