// ~~ mysterious glo🅱️al ~~
B = x => Buffer.from(x);

const fsFileSystem = require('../../util/fileSystem');
const stdPath = require('path');

module.exports = function (fileMap, dontFallThrough) {
  return fsFileSystem
    .keys()
    .reduce((mockFs, nextFsFunction) => {
      mockFs[nextFsFunction] = function (filePath) {
        const baseName = stdPath.basename(filePath);
        if (fileMap[baseName] !== undefined) {
          return R(fileMap[baseName]);
        } else if (!dontFallThrough) {
          return fsFileSystem[nextFsFunction](filePath);
        }
        return J(`${filePath} not found`);
      }
      return mockFs;
    }, {});
};
