const AWS = require('aws-sdk');
const promisify = require('util').promisify;
const s3 = new AWS.S3();
const putObject = promisify(s3.putObject.bind(s3));

module.exports = function (resource) {
  return putObject({
    Bucket: resource.compute.config.Bucket,
    Key: resource.compute.config.Key,
    Body: resource.data
  })
  .then(() => R({
    key: resource.compute.config.Key,
    bucket: resource.compute.config.Bucket
  }));
};
