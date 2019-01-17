#! /usr/bin/node

const serialize = require('./jsExtensions').serialize;
const compile = require('./language/compiler');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
const path = require('path');

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
  filename = path.resolve(process.cwd(), process.argv[3]);
}

const command = process.argv[2];

var work;
if (typeof stdinData === 'object') {
  work = stdinData.then(data => compile(command, data, filename))
} else if (typeof filename === 'string') {
  work = readFile(filename)
    .then(data => compile(command, data, filename));
} else {
  console.error('Usages:')
  console.error('    lit command filename');
  console.error('    <output from a previous lit command> | lit command');
  process.exit(127);
}

work
  .then(finalResults => {
    console.log(serialize(finalResults));
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
