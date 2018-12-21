const stdPath = require('path');

module.exports = function (config) {
  const path = config.path;
  return function (arg) {
    return new Promise(function (resolve, reject) {
      require(stdPath.resolve(path, 'lit_generated_host_entry'))
        .handler(arg, null, function (err, res) {
          if (err) reject(err);
          resolve(res);
        });
    })
  }
};
