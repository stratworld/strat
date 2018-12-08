const AWS = require('aws-sdk');
AWS.config.update(require('../../litconfig.json').aws.config);

const lambda = require('../aws/lambda/create');
const s3 = require('../aws/s3/upload');

module.exports = function (resources) {
  
  return Promise.all(resources.map(deploy))
}

function deploy (resource) {
  if (resource.host.compute.service === 'lambda') {
    return deployLambda(resource);
  }
  return deployS3(resource);
}

function deployLambda (resource) {
  return lambda(resource.hostPackage,
    resource.host.runtime,
    resource.host.compute.FunctionName,
    resource.role);
}

function deployS3 (resource) {
  return s3(resource.hostPackage,
    resource.host.compute.Key,
    resource.host.compute.Bucket);
}
