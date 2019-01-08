const path = require('path');
const fs = require('fs');

module.exports = () => {
  var potentialConfigFile;
  var lookedLocation;
  if (typeof process.argv[3] === 'string') {
    const invokedDirectory = path.dirname(
      path.resolve(process.cwd(), process.argv[3]));
    lookedLocation = invokedDirectory;
    potentialConfigFile = path.resolve(invokedDirectory, 'litconfig.json');
  } else {
    lookedLocation = process.cwd();
    potentialConfigFile = path.resolve(path.cwd(), 'litconfig.json');
  }
  if (fs.existsSync(potentialConfigFile)) {
    return require(potentialConfigFile);
  }
  throw `Could not find a litconfig.json file.  Looked in ${lookedLocation}`;
};