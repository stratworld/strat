const internet = require('../../util/theInternet');
const stdPath = require('path');

module.exports = function (fileMap, dontFallThrough) {

  return {
    isUrl: internet.isUrl,
    fetch: fetchFactory(fileMap, dontFallThrough),
    path: internet.path
  };
};

function fetchFactory (fileMap, dontFallThrough) {
  return function (url) {
    if (fileMap[url]) return fileMap[url];
    if (dontFallThrough) throw `Url ${url} not found in mocks`;
    return internet.fetch(url);
  };
}
