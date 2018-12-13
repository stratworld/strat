const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = function (config) {
  return function (arg) {
    console.log(config)
    var params = {
      Bucket: config.Bucket, 
      Key: config.Key
    };
    return new Promise(function (resolve, reject) {
      s3.getObject(params, function(err, data) {
        if (err) reject(err.stack);
        else resolve(data.Body.toString());
      });  
    });
  }
};
