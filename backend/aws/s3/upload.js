const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const promisify = require('util').promisify;
const readFile = promisify(require('fs').readFile);

module.exports = function (filePointer, fileName, bucket) {
  return readFile(filePointer)
    .then(fileData => {
      return new Promise(function (resolve, reject) {
        s3.createBucket({
          Bucket: bucket
        }, function (err, res) {
          if (err) reject(err);
          s3.putObject({
            Bucket: bucket,
            Key: fileName,
            Body: new Buffer(fileData, 'binary') 
          }, function (err, res) {
            if (err) reject(err);
            resolve(res);
          });
        });
      });
    });
};
