const AWS = require('aws-sdk');
const promisify = require('util').promisify;
const s3 = new AWS.S3();
const createBucket = promisify(s3.createBucket.bind(s3));

module.exports = function (s3Resources) {
  if ((s3Resources || [] .length) < 1) {
    return R();
  }
  const bucketName = s3Resources[0].compute.config.Bucket;
  
  return createBucket({
    Bucket: bucketName
  });
};
