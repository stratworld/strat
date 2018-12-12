R = x => Promise.resolve(x);
J = x => Promise.reject(x);

if (typeof Array.prototype.flat !== 'function') {
  Array.prototype.flat = function () {
    return this.reduce((fm, n) => fm.concat(n), []);
  }
}
if (typeof Array.prototype.flatmap !== 'function') {
  Array.prototype.flatmap = function (fn) {
    if (typeof fn === 'function') {
      return this.map(fn).flat();
    }
    return this.flat();
  };
}
if (typeof Array.prototype.purge !== 'function') {
  Array.prototype.purge = function () {
    return this.filter(x => x !== undefined);
  }
}
if (typeof Array.prototype.constantMapping !== 'function') {
  Array.prototype.constantMapping = function (constant) {
    return this.reduce((set, element) => {
      set[element] = constant;
      return set;
    }, {});
  }
}

if (typeof Object.prototype.values !== 'function') {
  Object.prototype.values = function () {
    return Object.keys(this).map(key => this[key]);
  }
}

if (typeof Object.prototype.keys !== 'function') {
  Object.prototype.keys = function () {
    return Object.keys(this);
  }
}

if (typeof Array.prototype.pipePromise !== 'function') {
  Array.prototype.pipePromise = function (startingPromise) {
    return this.reduce((totalPromise, nextPromise) => {
      return totalPromise.then(result => nextPromise(result));
    }, (startingPromise === undefined ? R() : startingPromise));
  }
}

module.exports = {
  serialize: truncateBuffersStringify
}

// 1) Buffers are annoying when serialized
// 2) 'stringify' is an obnoxious name
// 3) ', null, 2' is obnoxious
function truncateBuffersStringify (object) {
  return JSON.stringify(object, bufferCleaner, 2);
}

function bufferCleaner (key, value) {
  if (key === 'data' && value.data === undefined) {
    return `<Binary data Buffer of length ${value.length} truncated>`;
  }
  return value;
}
