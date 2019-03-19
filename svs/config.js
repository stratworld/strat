const path = require('path');
const fs = require('fs');

module.exports = () => {
  var potentialConfigFile;
  var lookedLocation;
  if (typeof process.argv[3] === 'string') {
    const invokedDirectory = path.dirname(
      path.resolve(process.cwd(), process.argv[3]));
    lookedLocation = invokedDirectory;
    potentialConfigFile = path.resolve(invokedDirectory, 'svs.json');
  } else {
    lookedLocation = process.cwd();
    potentialConfigFile = path.resolve(process.cwd(), 'svs.json');
  }
  if (fs.existsSync(potentialConfigFile)) {
    return require(potentialConfigFile);
  }
  return { substrate: 'local' };
};
