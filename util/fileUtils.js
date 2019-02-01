const promisify = require('util').promisify;
const stdPath = require('path');
const fs = require('fs');
const ls = promisify(fs.readdir);
const stat = promisify(fs.stat);
const isDirectory = file => stat(file)
  .then(stats => stats.isDirectory());

// This doesn't do anything in parallel, but it doesn't block.
async function recursiveLs (absoluteDirectoryPath) {
  const files = [];
  const stack = [absoluteDirectoryPath];
  var focus;

  // This is iterative to not blow up the stack
  // But does it really not create stack frames with this async/await magic?
  // todo: find out
  while (stack.length > 0) {
    focus = stack.pop();
    if (await isDirectory(focus)) {
      (await ls(focus))
        .forEach(fileName => {
          stack.push(stdPath.resolve(focus, fileName));
        });
    } else {
      files.push(focus);
    }
  }

  return files;
}

async function rimraf (absoluteDirectoryPath) {
  const files = await recursiveLs(absoluteDirectoryPath);
  // const fileTree = 
  return;
}

module.exports = {
  recursiveLs: recursiveLs,
  isDirectory: isDirectory,
  rimraf: rimraf
};
