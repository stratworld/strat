const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const defaults = require('./defaults.json');
const runtimes = require('./runtimes.json');
const readFile = require('util').promisify(require('fs').readFile);

module.exports = function (packageLocation, runtime, functionName, role) {
  const params = Object.assign({
    Runtime: runtimes[runtime]
  }, defaults);
  if (!params.Runtime) throw `could not find runtime ${runtime}`;

  return readFile(packageLocation)
    .then(fileData => {
      params.Code = { ZipFile: fileData }
      params.FunctionName = functionName;
      params.Role = role;

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
              name: functionName,
              FunctionName: res.FunctionName
            });
          }
        });
      });
    });
}