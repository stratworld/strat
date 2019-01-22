const serializeAST = require('../util/jsExtensions').serialize;
const frontend = require('./frontend/passes');
const midend = require('./midend/passes');
const backend = require('./backend/passes');
const errorFormat = require('./errors');


const everything = []
  .concat(frontend)
  .concat(midend)
  .concat(backend);

const prebuiltSegments = {
  frontend: frontend,
  midend: midend,
  backend: backend,
  build: frontend.concat(midend),
  deploy: backend
};

function getSegment (start, stop) {
  if (typeof start !== 'string') start = 'scan';
  const segment = [];
  var collecting = false;
  for (var i = 0; i < everything.length; i++) {
    if (everything[i].name === start) collecting = true;
    if (collecting) segment.push(everything[i]);
    if (everything[i].name === stop) break;
  }
  return segment;
}

function runSegment (start, stop, startingInput, filename) {
  return executePasses(getSegment(start, stop), startingInput, filename);
}

function runCommand (command, startingInput, filename) {
  const prebuilt = prebuiltSegments[command];
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

module.exports = {
  runCommand: runCommand,
  runSegment: runSegment,
  serializeAST: serializeAST
};
