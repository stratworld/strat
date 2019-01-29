const fsFileSystem = require('../../util/fileSystem');
const requireLoader = require('../../util/loader');
const compilerConstructor = require('../../language/compiler');
module.exports = function (mockDeps) {
  return compilerConstructor(Object.assign({
    fs: fsFileSystem,
    loader: requireLoader
  }, mockDeps)).runSegment;
};
