const internet = require('../../util/theInternet');
const stdPath = require('path');

module.exports = function (fileMap, dontFallThrough) {

  return {
    isUrl: internet.isUrl,
    cat: fetchFactory(fileMap, dontFallThrough),
    path: internet.path
  };
};

function fetchFactory (fileMap, dontFallThrough) {
  return function (url) {
    const mock = (fileMap || {})[url];
    if (mock) return mock;
    if (dontFallThrough) throw `Url ${url} not found in mocks`;
    return internet.fetch(url);
  };
}
