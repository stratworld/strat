const AWS = require('aws-sdk');
const sdkInfo = {
  substrate: 'aws',
  sdk: AWS,
  region: require('../../litconfig.json').aws.config.region
};

module.exports = ir => {
  const hostsWithEvents = ir.filter(host => host.events);
  return Promise.all(ir
    .filter(host => host.events)
    .map(connectHost)
  )
  .then(() => ir.map(host => host));
}

function connectHost (host) {
  const events = host.events;
  const connectors = host.events
    .reduce((connectors, host) => {
      connectors[host.type] = host.connector;
      return connectors;
    }, {});

  return Promise.all(connectors.keys()
    .map(eventType => {
      const connector = require(connectors[eventType]);
      return connector(
        sdkInfo,
        {
          events: events,
          service: host.scope,
          role: host.role
        },
        host.implementation
      );
    }));
}
