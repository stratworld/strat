const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const defaults = require('./defaults');
const runtimes = require('./runtimes.json');

module.exports = async function (resource) {
  const params = Object.assign({
    Runtime: runtimes[resource.runtime]
  }, defaults);
  if (!params.Runtime) throw `could not find runtime ${runtime}`;

  params.Code = { ZipFile: resource.data }
  params.FunctionName = resource.compute.config.FunctionName;
  params.Role = resource.role;

  async function attemptToCreateLambda (backoff) {
    var result;
    try {
      result = await new Promise(function(resolve, reject) {
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
    } catch (e) {
      if (e.message === 'The role defined for the function cannot be assumed by Lambda.') {
        if (backoff > 16000) {
          throw `IAM roles still not assumable after exponential backoff retrys.
Try to do this again later.  Error: ${e.stack}`;
        }
        console.log(`IAM roles not assumable yet; waiting ${backoff / 1000} seconds.`);
        await new Promise(function (resolve, reject) {
          setTimeout(resolve, backoff);
        });
        return attemptToCreateLambda(backoff * 2);
      }
      throw e;
    }
    return result;
  }
  console.log(`Creating lambda ${resource.compute.config.FunctionName}`);
  return attemptToCreateLambda(2000);
}