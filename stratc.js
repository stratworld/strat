#!/usr/bin/env node

const compilerConstructor = require('./stratc/compiler');
const svs = require('./svs/substrateFactory')();
const defaultFs = require('./util/fileSystem');
const defaultLoader = require('./util/loader');
const defaultInternet = require('./util/theInternet');
const errorFormat = require('./stratc/errors');
const compiler = compilerConstructor({
  fs: defaultFs,
  loader: defaultLoader,
  internet: defaultInternet
});
const compile = compiler.runCommand;
const serializeAST = compiler.serializeAST;

const stdPath = require('path');
//this is true for win 64 too...
const isWindows = process.platform === 'win32';

var stdinData;
//don't activate this feature for windows users;
//assumption is compiler development will happen on
//linux and OSX, and isTTY breaks for cygwin users
if (!isWindows && !process.stdin.isTTY) {
  stdinData = new Promise(function (resolve, reject) {
    const stdin = process.openStdin();
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

var filename;
if (process.argv[3] !== undefined) {
  filename = stdPath.resolve(process.cwd(), process.argv[3]);
}

var command = process.argv[2];

if (command === '-v' || command === '--version') {
  const packageJson = require('./package.json');
  console.log(packageJson.version);
  process.exit(0);
}

if (typeof command === 'string' && filename === undefined) {
  if (command.indexOf('.st') > 0) {
    filename = command;
    command = 'build';
  } else if (command.indexOf('.sa') > 0) {
    filename = command;
    command = 'deploy';
  }
}

if (command === '--aws' || command === '--local') {
  command = 'deploy';
}

if (command === 'help' || command === '-h' || command === '--help') {
  const help = defaultFs.cat(stdPath.resolve(__dirname, 'docsSrc/markdown/Guides/Getting Started.md'))
    .then(help => {
      console.log(help.toString());
      process.exit(0);
    });
} else {
  var work;
  if (typeof stdinData === 'object') {
    work = stdinData.then(data => compile(command, data, filename))
  } else if (command === 'deploy') {
    work = defaultFs.cat(filename)
      .then(svs);
  } else if (typeof filename === 'string') {
    work = defaultFs.cat(filename)
      .then(data => compile(command, data, filename));
  } else {
    console.error('Invalid command.  For help:');
    console.error('stratc --help');
    process.exit(127);
  }

  work
    .then(finalResults => {
      console.log(serializeAST(finalResults));
      process.exit(0);
    })
    .catch(errorFormat)
    .catch(e => {
      if (Array.isArray(e)) {
        console.error(e.filter(error => !error.printed));
      } else if (!e.printed) {
        console.error(e);
      }
      process.exit(1);
    });
}
