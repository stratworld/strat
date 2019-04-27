const Hijack = function () {};
Hijack.prototype.getDomo = function (serviceName) {
  return this.domos[this.domoLookup[serviceName]];
};

Hijack.prototype.setDomos = async function (domosByServiceName) {
  const uniqueDomos = domosByServiceName
    .values()
    .toMap(domoInfo => domoInfo.domo, domoInfo => domoInfo.hostName);
  this.domoLookup = domosByServiceName
    .pairs()
    .toMap(kvp => kvp[1].hostName, kvp => kvp[0]);
  this.domos = (await Promise.all(uniqueDomos.pairs()
    .map(async kvp => {
      const hostName = kvp[0];
      const domo = kvp[1];
      const domoClosure = await domo(this.getInvoker(hostName), hostName, 3);
      return [hostName, domoClosure];
    })))
    .toMap(kvp => kvp[1], kvp => kvp[0]);
};

Hijack.prototype.getInvoker = function (hostName) {
  return async (dep, event) => {
    try {
      return this.registry[dep](event);
    }catch (e) {
      console.log('could not invoke dep ' + dep);
    }
  }
};

Hijack.prototype.setRegistry = function (registry) {
  this.registry = registry;
};

Hijack.prototype.sendEvent = function (event, hostName) {
  const domo = this.getDomo(hostName);
  domo(event, fnName => this.registry[fnName]);
};

Hijack.prototype.dispatch = function (hostName, event) {
  return this.domos[hostName].dispatch(event);
}

const hijack = new Hijack();

const instanceFunctionWrapper = function (hostName) {
  return hijack.getDomo(hostName);
}
instanceFunctionWrapper.setDomos = async function (domos) {
  await hijack.setDomos(domos);
};
instanceFunctionWrapper.setRegistry = function (registry) {
  hijack.setRegistry(registry);
};
instanceFunctionWrapper.dispatch = function (hostName, event) {
  return hijack.dispatch(hostName, event);
};

module.exports = instanceFunctionWrapper;
