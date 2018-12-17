const AWS = require('aws-sdk');
AWS.config.update(require('../../litconfig.json').aws.config);

const lambda = require('../aws/lambda/create');
const s3 = require('../aws/s3/upload');
const s3Upload = s3.upload;
const createBucket = s3.createBucket;

module.exports = function (resources) {
  return preDeploy(resources)
    .then(() => Promise.all(resources.map(resource => {
      return deploy(resource)
        .then(implementation => {
          resource.implementation = implementation;
          return R(resource);
        });
    })));
}

function preDeploy (resources) {
  const s3Resources = resources
    .filter(resource => resource.compute.service === 's3');
  if (s3Resources.length > 0) {
    return createBucket(s3Resources[0].compute.Bucket);
  }
  return R();
}

function deploy (resource) {
  if (resource.compute.service === 'lambda') {
    return lambda(resource);
  }
  return s3Upload(resource);
}
