R = x => Promise.resolve(x);
J = x => Promise.reject(x);
ID = x => x;
C = x => console.log(JSON.stringify(x, null, 2));

Object.defineProperty(Array.prototype, 'flat',{
  value: function() {
    return this.reduce((fm, n) => fm.concat(n), []);
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Array.prototype, 'flatmap',{
  value: function(fn) {
    if (typeof fn === 'function') {
      return this.map(fn).flat();
    }
    return this.flat();
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Array.prototype, 'purge',{
  value: function() {
    return this.filter(x => x !== undefined);
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Array.prototype, 'constantMapping',{
  value: function(constant) {
    var valueGenerator;
    if (Array.isArray(constant)) {
      valueGenerator = () => Array.from(constant);
    } else if (typeof constant === 'object') {
      valueGenerator = () => Object.assign({}, constant);
    } else {
      valueGenerator = () => constant;
    }
    return this.reduce((set, element) => {
      set[element] = valueGenerator();
      return set;
    }, {});
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Array.prototype, 'first',{
  value: function(predicate) {
    return typeof predicate === 'function'
      ? this.filter(predicate)[0]
      : this[0];
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Array.prototype, 'toMap',{
  value: function(getValues, getKeys = key => key) {
    if (typeof getValues !== 'function') {
      getValues = () => true;
    }
    return this.reduce((map, item) => {
      map[getKeys(item)] = getValues(item);
      return map;
    }, {});
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Object.prototype, 'values',{
  value: function() {
    return Object.keys(this).map(key => this[key]);
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Object.prototype, 'keys',{
  value: function() {
    return Object.keys(this);
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Object.prototype, 'pairs',{
  value: function() {
    return Object.keys(this)
      .map(key => [key, this[key]]);
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Object.prototype, 'purge',{
  value: function() {
    Object.keys(this)
      .forEach(key => {
        if (this[key] === undefined) {
          delete this[key];
        }
      });
    return this;
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Object.prototype, 'intersect',{
  value: function(other) {
    return Object.keys(this)
      .filter(key => other[key] !== undefined)
      .constantMapping(true);
  },
  writable: true,
  configurable: true,
  enumerable: false
});

const crypto = require('crypto');
Object.defineProperty(Object.prototype, 'hash',{
  value: function() {
    const shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(this));
    return shasum.digest('hex');
  },
  writable: true,
  configurable: true,
  enumerable: false
});

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
