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
  build: frontend.concat(midend),
  deploy: backend
};

function runCommand (command, startingInput, filename) {
  const prebuilt = passChains[command];
  if (prebuilt) {
    return executePasses(prebuilt, startingInput, filename);
  } else {
    const singleCommand = everything
      .first(potentialCommand => potentialCommand.name === command);
    if (singleCommand) {
      return executePasses([singleCommand], startingInput, filename);
    }
  }
  return J(`Could not find command ${command}`);
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
