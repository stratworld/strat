const ast = require('../../ast');
const stdPath = require('path');
const promisify = require('util').promisify;
const readFile = promisify(require('fs').readFile);
const line = ast.line;
const val = ast.val;
const traverse = ast.traverse;
const getConfig = ast.getConfig;

module.exports = deps => ast => {
  return Promise.all(traverse(ast, ['file']).map(file => {
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
  .then(() => R(ast));
};

function getArtifact (fn, declaredPath) {
  if (Buffer.isBuffer(fn.artifact)) {
    return {
      artifactType: 'buffer',
      value: fn.artifact
    };
  }
  const artifactValue = val(fn, 'artifact');
  const filePath = stdPath.isAbsolute(artifactValue)
    ? artifactValue
    : stdPath.resolve(stdPath.dirname(declaredPath), artifactValue);
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
        msg: `${declaredPath} line ${line(fn, 'artifact')}
Failed to load file ${filePath}.`
      })
    })
}
