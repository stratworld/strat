// ~~ mysterious glo🅱️al ~~
B = x => Buffer.from(x);

const fsFileSystem = require('../../util/fileSystem');
const stdPath = require('path');

module.exports = function (fileMap, dontFallThrough) {

  function overrideFs (fallthrough) {
    return async function overrideFs (filePath) {
      const baseName = stdPath.basename(filePath);
      const mock = (fileMap || {})[baseName];
      if (mock !== undefined) {
        return Buffer.isBuffer(mock)
          ? mock
          : Buffer.from(mock);
      } else if (!dontFallThrough) {
        return fsFileSystem[fallthrough](filePath);
      }
      throw `${filePath} not found`;
    }
  }

  return {
    cat: overrideFs('cat'),
    ls: overrideFs('ls'),
    stat: overrideFs('stat'),
    path: fsFileSystem.path
  }
};
