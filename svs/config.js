const path = require('path');
const fs = require('fs');

const svsNames = {
  '--aws': 'aws',
  '--local': 'local'
};

module.exports = () => {
  var svsOverride = svsNames[process.argv[2]];
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
    const config = require(potentialConfigFile);
    return svsOverride !== undefined
      ? Object.assign(config, { substrate: svsOverride })
      : config;
  }
  return {
    substrate: svsOverride || 'local',
    aws: {
      config: {
        region: 'us-west-2'
      }
    }
  };
};
