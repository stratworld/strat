const promisify = require('util').promisify;
const stdPath = require('path');
const fs = require('fs');
const ls = promisify(fs.readdir);
const rm = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
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

async function rimraf (absolutePath) {
  if (await isDirectory(absolutePath)) {
    const filesInDirectory = await ls(absolutePath);
    if (filesInDirectory.length !== 0) {
      await Promise.all(filesInDirectory
        .map(file => rimraf(stdPath.resolve(absolutePath, file))));
    }
    return rmdir(absolutePath);
  } else {
    return rm(absolutePath);
  }
}

module.exports = {
  recursiveLs: recursiveLs,
  isDirectory: isDirectory,
  rimraf: rimraf
};
