R = x => Promise.resolve(x);
J = x => Promise.reject(x);

Array.prototype.flat = function () {
  return this.reduce((fm, n) => fm.concat(n), []);
}

Array.prototype.flatmap = function (fn) {
  if (typeof fn === 'function') {
    return this.map(fn).flat();
  }
  return this.flat();
};

Array.prototype.purge = function () {
  return this.filter(x => x !== undefined);
}

Array.prototype.constantMapping = function (constant) {
  return this.reduce((set, element) => {
    set[element] = constant;
    return set;
  }, {});
}

Array.prototype.pipePromise = function (startingPromise) {
  return this.reduce((totalPromise, nextPromise) => {
    return totalPromise.then(result => nextPromise(result));
  }, (startingPromise === undefined ? R() : startingPromise));
}

Array.prototype.first = function (predicate) {
  return typeof predicate === 'function'
    ? this.filter(predicate)[0]
    : this[0];
}

Object.prototype.values = function () {
  return Object.keys(this).map(key => this[key]);
}

Object.prototype.keys = function () {
  return Object.keys(this);
}

Object.prototype.pairs = function () {
  return Object.keys(this)
    .map(key => [key, this[key]]);
};

Object.prototype.purge = function () {
  Object.keys(this)
    .forEach(key => {
      if (this[key] === undefined) {
        delete this[key];
      }
    });
  return this;
}

const crypto = require('crypto');

//not meant to be secure
Object.prototype.hash = function () {
  const shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(this));
  return shasum.digest('hex');
}

module.exports = truncateBuffersStringify;

//Buffers are annoying when serialized
function truncateBuffersStringify (object) {
  return JSON.stringify(object, bufferCleaner, 2);
}

function bufferCleaner (key, value) {
  if (key === 'data' && value.data === undefined) {
    return `<Binary data Buffer of length ${value.length} truncated>`;
  }
  return value;
}
