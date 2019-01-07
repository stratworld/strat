module.exports = (sdkInfo, eventInfo, implementation) => {
  if (sdkInfo.substrate === 'aws') {
    const apiGateway = require('./apiGateway/apiBuilder');
    return apiGateway(sdkInfo.region, sdkInfo.sdk, eventInfo, implementation);
  }
  const stdHttp = require('./stdHttp/apiBuilder');
  return stdHttp(eventInfo, implementation);
};
