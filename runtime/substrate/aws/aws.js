const path = require('path');
const AWS = require('aws-sdk');
const config = require('../../../litconfig.json').aws.config;
AWS.config.update(config);

module.exports = {
  info: {
    substrate: 'aws',
    sdk: AWS,
    region: config.region
  },
  resources: function (host, id) {
    return host.runtime === undefined
      ? getBlobImplementation(host, id)
      : getFunctionImplementation(host, id)
  }
};

function getBlobImplementation (host, id) {
  return {
    type: 'blob',
    service: 's3',
    preCreate: path.resolve(__dirname, 's3/createBucket.js'),
    create: path.resolve(__dirname, 's3/upload.js'),
    invoke: path.resolve(__dirname, 's3/download.js'),
    config: {
      Key: host.name,
      Bucket: id
    }
  };
}

function getFunctionImplementation (host, id) {
  return {
    type: 'function',
    service: 'lambda',
    create: path.resolve(__dirname, 'lambda/create.js'),
    invoke: path.resolve(__dirname, 'lambda/invoke.js'),
    config: {
      FunctionName: `${id}-${host.name}`
    }
  };
}
