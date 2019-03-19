module.exports = (sdkInfo, eventInfo, implementation, sourceConfig) => {
  const apiGateway = require('../../awsResources/apiGateway/apiBuilder');
  return apiGateway(sdkInfo.region, sdkInfo.sdk, eventInfo, implementation);
};
