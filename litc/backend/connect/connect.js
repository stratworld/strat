const sdkInfo = require('../../../runtime/substrate/substrateFactory')().info;
const config = require('../../../runtime/config')();

module.exports = deps => ir => {
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

  const substrateConfig = (config[sdkInfo.substrate] || {});

  return Promise.all(connectors.keys()
    .map(eventType => {
      const connector = require(connectors[eventType]);
      const sourceConfig = substrateConfig[eventType];
      return connector(
        sdkInfo,
        {
          events: events,
          service: host.scope,
          role: host.role
        },
        host.implementation,
        sourceConfig
      );
    }));
}
