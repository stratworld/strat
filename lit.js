#! /usr/bin/node

require('./jsExtensions');
const frontend = require('./frontend/passes');
const midend = require('./midend/passes');
const backend = require('./backend/passes');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const path = require('path');

var stdinData;
if (!process.stdin.isTTY) {
  stdinData = new Promise(function (resolve, reject) {
    var stdin = process.openStdin();
    var data = "";
    stdin.on('data', function(chunk) {
      data += chunk;
    });
    stdin.on('end', function() {
      resolve(data);
    });
  })
  .then(data => {
    if (data.indexOf('FAILURE') === 0) {
      console.log(data);
      process.exit(1);
    }
    try {
      return R(JSON.parse(data));
    } catch (e) {
      return J(`Failed to parse input as json: ${e}`)
    }
  });
}

function scanArgumentFile (filename) {
  return readFile(filename)
    .then(fileData => fileData.toString());
}

function executeChain (chain, filename) {
  if ((chain || []).length === 0) return;
  var startingDataPromise;
  if (chain[0].name === 'scan') {
    startingDataPromise = scanArgumentFile(filename);
  } else if (typeof stdinData === 'object') {
    startingDataPromise = stdinData;
  } else {
    //todo: inform the user what command's output should be piped
    console.log(`pipe data into this ex:
      $ lit scan foo.lit | lit ${chain[0].name}`);
    process.exit(1);
  }

  return chain
    .map(link => executeLinkPromise(link, filename))
    .pipePromise(startingDataPromise);
}

function executeLinkPromise (link, filename) {
  return function (previousLinkResults) {
    try {
      const result = require(link.entry)(previousLinkResults, filename);
      return typeof result.then === 'function'
        ? result
        : R(result);
    } catch (err) {
      console.error(`Failure while running '${link.name}'.`)
      return J(err);
    }
  }
}

const everything = []
  .concat(frontend)
  .concat(midend)
  .concat(backend);

const commands = {
  frontend: fn => executeChain(frontend, fn),
  midend: fn => executeChain(midend, fn),
  backend: fn => executeChain(backend, fn),
  build: fn => executeChain(everything, fn)
};

function runCommand (command, filepath) {
  if (command === undefined) {
    console.log(`usage: lit command [filename]
    where command is one of:
      ${commands.keys().join('\n    ')}`);
    process.exit(1);
  } else {
    const prebuilt = commands[command];
    if (prebuilt) {
      return prebuilt(filepath);
    } else {
      const singleCommand = everything
        .filter(potentialCommand => potentialCommand.name === command)
        [0];
      if (singleCommand !== undefined) {
        return executeChain([singleCommand], filepath);
      } else {
        return J(`Could not find command ${command}`);
      }
    }
  }
}

module.exports = runCommand;

var filename;
if (process.argv[3] !== undefined) {
  filename = path.resolve(process.cwd(), process.argv[3]);
}

if (require.main === module) {
  runCommand(process.argv[2], filename)
    .then(finalResults => {
      console.log(JSON.stringify(finalResults, null, 2));
      process.exit(0);
    })
    .catch(e => {
      //todo: identify if this is an internal failure or a logical failure
      console.log('FAILURE');
      console.log(e);
      process.exit(1);
    });
}
