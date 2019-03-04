const readFile = require('util').promisify(require('fs').readFile);

module.exports = function (config) {
  const path = config.path;
  return function () {
    return readFile(path)
      .then(data => {
        return {
          data: data.toString()
        };
      });
  }
};