const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();


module.exports = function (config) {
  return function callLambda (arg) {
    const params = {
      InvocationType: 'RequestResponse',
      FunctionName: config.FunctionName
    };

    // optional sort of thingie
    var argument;
    if (arg !== undefined && arg !== null) {
      argument = {
        valuePresent: arg !== undefined && arg !== null,
        value: arg
      }
    } else {
      argument = {
        valuePresent: false,
      }
    }

    params.Payload = Buffer.from(JSON.stringify(argument));

    return new Promise(function (resolve, reject) {
      lambda.invoke(params, function (err, res) {
        if (err) {
          reject(err);
        } else {
          const result = JSON.parse(res.Payload);
          if (result.__LE) {
            reject(result.error);
          } else {
            resolve(result);  
          }
        }
      });
    });
  }
}

