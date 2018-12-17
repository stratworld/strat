const AWS = require('aws-sdk');
const promisify = require('util').promisify;
const s3 = new AWS.S3();
const createBucket = promisify(s3.createBucket.bind(s3));
const putObject = promisify(s3.putObject.bind(s3));

function upload (resource) {
  return putObject({
    Bucket: resource.compute.Bucket,
    Key: resource.compute.Key,
    Body: resource.data
  })
  .then(() => R({
    key: resource.compute.Key,
    bucket: resource.compute.Bucket
  }));
};

module.exports = {
  upload: upload,
  createBucket: bucketName => createBucket({ Bucket: bucketName })
}