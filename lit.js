#! /usr/bin/node

const compilerConstructor = require('./litc/compiler');
const defaultFs = require('./util/fileSystem');
const defaultLoader = require('./util/loader');
const defaultInternet = require('./util/theInternet');
const compiler = compilerConstructor({
  fs: defaultFs,
  loader: defaultLoader,
  internet: defaultInternet
});
const compile = compiler.runCommand;
const serializeAST = compiler.serializeAST;

const stdPath = require('path');

var stdinData;
if (!process.stdin.isTTY) {
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

const command = process.argv[2];

if (command === '-v' || command === '--version') {
  const packageJson = require('./package.json');
  console.log(packageJson.version);
  process.exit(0);
}

if (command === 'help' || command === '-h' || command === '--help') {
  const help = defaultFs.cat(stdPath.resolve('./', 'docsSrc/markdown/Guides/Getting Started.md'))
    .then(help => {
      console.log(help.toString());
      process.exit(0);
    });
} else {
  var work;
  if (typeof stdinData === 'object') {
    work = stdinData.then(data => compile(command, data, filename))
  } else if (typeof filename === 'string') {
    work = defaultFs.cat(filename)
      .then(data => compile(command, data, filename));
  } else {
    console.error('Usages:')
    console.error('    lit command filename');
    console.error('    <output from a previous lit command> | lit command');
    process.exit(127);
  }

  work
    .then(finalResults => {
      console.log(serializeAST(finalResults));
      process.exit(0);
    })
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
}
