const fs = require('fs');
const promisify = require('util').promisify;

module.exports = {
  stat: promisify(fs.stat),
  ls: promisify(fs.readdir),
  cat: promisify(fs.readFile)
};
