const fs = require('../mocks/mockFileSystem')();
const internet = require('../mocks/mockInternet')();
const loader = require('../mocks/mockLoader');

const compilerConstructor = require('../../stratc/compiler');
module.exports = function (overrideDeps) {
  return compilerConstructor(Object.assign({
    fs: fs,
    internet: internet,
    loader: loader
  }, overrideDeps)).runSegment;
};
