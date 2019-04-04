const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const defaults = require('./defaults.json');
const runtimes = require('./runtimes.json');

module.exports = async function (resource) {
  const params = Object.assign({
    Runtime: runtimes[resource.runtime]
  }, defaults);
  if (!params.Runtime) throw `could not find runtime ${runtime}`;

  params.Code = { ZipFile: resource.data }
  params.FunctionName = resource.compute.config.FunctionName;
  params.Role = resource.role;

  /*
  3 second default timeout is too slow for cold starts in serial lambda calls.
  Each cold start is ~1900ms in preliminary testing, which leads to a 3.8s
  cold start for 2x serial lambdas.  Setting a perfect timeout here is impossible;
  this need to be surfaced to the end user.
  */
  params.Timeout = 20;

  /*
  128 is totally appropriate RAM for operations that don't load a large bundle.
  We might want to switch this around based on how large the bundle is.
  A 1MB bundle was paging with 128 RAM and "maxing out" at ~170 according
  to the lambda console.
  */
  params.MemorySize = 256;

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