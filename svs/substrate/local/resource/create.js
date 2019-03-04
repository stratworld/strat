const writeFile = require('util').promisify(require('fs').writeFile);

module.exports = resource => {
  return writeFile(resource.compute.config.path, resource.data)
    .then(() => resource.compute.config.path);
}