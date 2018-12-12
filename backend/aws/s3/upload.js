const AWS = require('aws-sdk');
const promisify = require('util').promisify;
const s3 = new AWS.S3();

const createBucket = promisify(s3.createBucket.bind(s3));
const putObject = promisify(s3.putObject.bind(s3));
const createBucketIdempotent = function (config) {
  return createBucket(config)
    .catch(e => R()) // todo: actually catch errors here
}

module.exports = function (resource) {
  //todo: don't create the bucket everytime; S3 might not like this?
  return createBucketIdempotent({
    Bucket: resource.Bucket
  })
  .then(() => putObject({
    Bucket: resource.Bucket,
    Key: resource.Key,
    Body: resource.data
  }))
  .then(() => R(`Successfully uploaded ${resource.Bucket}/${resource.Key}`));
};
