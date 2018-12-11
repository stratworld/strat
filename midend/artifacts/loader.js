const ast = require('../../ast');
const stdPath = require('path');
const promisify = require('util').promisify;
const readFile = promisify(require('fs').readFile);
const line = ast.line;
const val = ast.val;
const traverse = ast.traverse;
const getConfig = ast.getConfig;

module.exports = function (ir) {
  return Promise.all(traverse(ir, ['file']).map(file => {
    const services = traverse(file, ['service']);
    const filePath = val(file, 'path');
    return Promise.all(services.map(service => {
      return Promise.all(traverse(service, ['function'])
        .map(fn => {
          return resolveArtifact(service, fn, filePath)
            .then(artifact => {
              fn.artifact = artifact;
            });
        }));
    }));
  }))
  .then(() => R(ir));
};

//todo: branch on what the artifact declaration is.
// In the future, more than just single files can be
// artifacts.  Web addresses can be artifacts.
function load (filePath) {
  return readFile(filePath);
}

function getType (filePath) {
  return stdPath.extname(filePath);
}

function resolveArtifact (service, fn, declaredPath) {
  const filePath = getArtifactPath(service, fn, declaredPath);
  const type = getType(filePath);
  return load(filePath, type)
    .then(data => R({
      data: data,
      type: type,
      path: filePath
    }))
    .catch(e => {
      return J({
        error: e,
        msg: `${declaredPath} line ${getConfig(fn, 'artifact').line}
Failed to load file ${filePath}.`
      })
    })
}

function getArtifactPath (service, fn, declaredPath) {
  const artifactPath = checkAndGetConfig(fn, 'artifact', declaredPath);
  return stdPath.isAbsolute(artifactPath)
    ? artifactPath
    : stdPath.resolve(stdPath.dirname(declaredPath), artifactPath);
}

function checkAndGetConfig (fn, key, declaredPath) {
  const valueToken = getConfig(fn, key);
  const fnLine = line(fn, 'name');
  if (valueToken === undefined) {
    throw {
      error: 'Invalid function',
      msg: `${declaredPath} line ${fnLine}
Function ${val(fn, 'name')} is missing required key '${key}'`
    };
  }
  return valueToken.value;
}
