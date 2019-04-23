const Hijack = function () {};
Hijack.prototype.getDomo = function (hostName) {
  return this.domos[hostName];
};

Hijack.prototype.setDomos = async function (domos) {
  this.domos = (await Promise.all(domos.pairs()
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
