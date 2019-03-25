const sdkInfo = require('../../awsResources/aws').info;
const config = require('../../../config')();
const Http = require('./httpConnector');

module.exports = ir => {
  const hostsWithEvents = ir.filter(host => host.events);
  return Promise.all(ir
    .filter(host => host.events.length > 0)
    .map(connectHost)
  )
  .then(() => ir.map(host => host));
}

function connectHost (host) {
  const events = host.events;
  const connectors = {
    'Http': Http
  };

  const substrateConfig = (config[sdkInfo.substrate] || {});

  return Promise.all(connectors.keys()
    .map(eventType => {
      const connector = connectors[eventType];
      const sourceConfig = substrateConfig[eventType];
      if (connector === undefined) {
        return J(`Event type ${eventType} not supported`);
      }
      return connector(
        sdkInfo,
        {
          events: events,
          //TODO: totally wrong:
          service: host.artifacts[0].scope,
          role: host.role
        },
        host.implementation,
        sourceConfig
      );
    }));
}
