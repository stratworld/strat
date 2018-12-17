const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const defaults = require('./defaults.json');
const runtimes = require('./runtimes.json');

module.exports = function (resource) {
  const params = Object.assign({
    Runtime: runtimes[resource.runtime]
  }, defaults);
  if (!params.Runtime) throw `could not find runtime ${runtime}`;

  params.Code = { ZipFile: resource.data }
  params.FunctionName = resource.compute.FunctionName;
  params.Role = resource.role;

  /*
  3 second default timeout is too slow for cold starts in serial lambda calls.
  Each cold start is ~1900ms in preliminary testing, which leads to a 3.8s
  cold start for 2x serial lambdas.  Setting a perfect timeout here is impossible;
  this need to be surfaced to the end user.
  */
  params.Timeout = 20;

  return new Promise(function(resolve, reject) {
    lambda.createFunction(params, function (err, res) {
      if (err) reject(err);
      else {
        resolve({
          functionName: res.FunctionName,
          functionArn: res.FunctionArn
        });
      }
    });
  });
}