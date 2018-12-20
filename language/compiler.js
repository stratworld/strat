const frontend = require('./frontend/passes');
const midend = require('./midend/passes');
const backend = require('./backend/passes');
const errorFormat = require('./errors');

const everything = []
  .concat(frontend)
  .concat(midend)
  .concat(backend);

const passChains = {
  frontend: frontend,
  midend: midend,
  backend: backend,
  build: everything
};

function runCommand (command, startingInput, filename) {
  if (command === undefined) {
    return J(`usage: lit command [filename]
    where command is one of:
      ${commands.keys().join('\n    ')}`);
  } else {
    const prebuilt = passChains[command];
    if (prebuilt) {
      return executePasses(prebuilt, startingInput, filename);
    } else {
      const singleCommand = everything
        .filter(potentialCommand => potentialCommand.name === command)
        [0];
      if (singleCommand !== undefined) {
        return executePasses([singleCommand], startingInput, filename);
      } else {
        return J(`Could not find command ${command}`);
      }
    }
  }
}

function executePasses (passes, startingInput, filename) {
  return passes
    .reduce((previousResultPromise, nextPass) => {
      return previousResultPromise
        .then(result => require(nextPass.entry)(result, filename))
    }, R(startingInput))
    .catch(errorFormat);
}

module.exports = runCommand;
