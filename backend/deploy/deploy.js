const AWS = require('aws-sdk');
AWS.config.update(require('../../litconfig.json').aws.config);

const lambda = require('../aws/lambda/create');
const s3 = require('../aws/s3/upload');

module.exports = function (resources) {
  return Promise.all(resources.map(deploy))
}

function deploy (resource) {
  if (resource.service === 'lambda') {
    return lambda(resource);
  }
  return s3(resource);
}
