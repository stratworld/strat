const fs = require('../mocks/mockFileSystem')();
const internet = require('../mocks/mockInternet')();

const compilerConstructor = require('../../stratc/compiler');
module.exports = function (overrideDeps) {
  return compilerConstructor(Object.assign({
    fs: fs,
    internet: internet,
    loader: require
  }, overrideDeps)).runSegment;
};
