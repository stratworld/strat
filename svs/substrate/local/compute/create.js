const Zip = require('adm-zip');

module.exports = resource => {
  const zipFile = new Zip(resource.data);
  zipFile.extractAllTo(resource.compute.config.path);
  return R(resource.compute.config.path);
};
