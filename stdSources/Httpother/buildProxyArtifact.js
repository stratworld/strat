const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const baseRouter = path.resolve(__dirname, 'baseHttpRouter.js');
const traverser = path.resolve(__dirname, 'traverser.js');

module.exports = function (tree) {
  return tree === undefined
    ? Promise.resolve()
    : Promise.all([
      Promise.resolve(Buffer.from(`const tree = ${JSON.stringify(tree)}`)),
      readFile(traverser),
      readFile(baseRouter)
    ])
    .then(buffers => Promise.resolve(Buffer.concat(buffers)));
};
