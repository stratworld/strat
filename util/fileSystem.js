const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

module.exports = {
  stat: promisify(fs.stat),
  ls: promisify(fs.readdir),
  cat: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  path: {
    extname: path.extname,
    resolve: path.resolve,
    dirname: path.dirname,
    basename: path.basename
  }
};
