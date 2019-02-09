const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const baseRouter = path.resolve(__dirname, 'baseHttpRouter.js');
const pathToRegex = path.resolve(__dirname, 'pathToRegex.js');

module.exports = function (tree) {
  return tree === undefined
    ? Promise.resolve()
    : Promise.all([
      Promise.resolve(Buffer.from(`const tree = ${JSON.stringify(tree)};`)),
      readFile(pathToRegex),
      readFile(baseRouter)
    ])
    .then(buffers => Promise.resolve(Buffer.concat(buffers)));
};
