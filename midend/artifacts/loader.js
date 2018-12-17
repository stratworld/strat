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
    const functions = traverse(file, ['service', 'function']);
    const filePath = val(file, 'path');
    return Promise.all(functions
      .map(fn => {
        return resolveArtifact(fn, filePath)
          .then(artifact => {
            fn.artifact = artifact;
          });
      }));
  }))
  .then(() => R(ir));
};

function getArtifact (fn, declaredPath) {
  const configValue = checkAndGetConfig(fn, 'artifact', declaredPath);
  if (Buffer.isBuffer(configValue)) {
    return {
      artifactType: 'buffer',
      value: configValue
    };
  }
  const filePath = stdPath.isAbsolute(configValue)
    ? configValue
    : stdPath.resolve(stdPath.dirname(declaredPath), configValue);
  return {
    artifactType: 'file',
    value: filePath
  };
}

function resolveArtifact (fn, declaredPath) {
  const artifact = getArtifact(fn, declaredPath);
  if (artifact.artifactType === 'buffer') {
    return R({
      data: artifact.value,
      type: '.js',
      path: 'bufferData.js'
    });
  }

  const filePath = artifact.value;
  const type = stdPath.extname(filePath);
  return readFile(filePath)
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
