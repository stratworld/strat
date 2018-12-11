const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = function (resource) {
  return new Promise(function (resolve, reject) {
    s3.createBucket({
      Bucket: resource.Bucket
    }, function (err, res) {
      if (err) reject(err);
      s3.putObject({
        Bucket: resource.Bucket,
        Key: resource.Key,
        Body: resource.data
      }, function (err, res) {
        if (err) reject(err);
        resolve(`Successfully uploaded ${resource.Bucket}/${resource.Key}`);
      });
    });
  });
};
