const AWS = require('aws-sdk');
const promisify = require('util').promisify;
const s3 = new AWS.S3();
const createBucket = promisify(s3.createBucket.bind(s3));
const putObject = promisify(s3.putObject.bind(s3));

function upload (resource) {
  return putObject({
    Bucket: resource.Bucket,
    Key: resource.Key,
    Body: resource.data
  })
  .then(() => R(`Successfully uploaded ${resource.Bucket}/${resource.Key}`));
};

module.exports = {
  upload: upload,
  createBucket: bucketName => createBucket({ Bucket: bucketName })
}