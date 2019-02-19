const ast = require('../../ast');
const stdPath = require('path');
const line = ast.line;
const val = ast.val;
const traverse = ast.traverse;
const getConfig = ast.getConfig;

var deps;
module.exports = injectedDeps => ast => {
  deps = injectedDeps;
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

async function resolveArtifact (fn, declaredPath) {
  const artifact = getArtifact(fn, declaredPath);
  if (artifact.artifactType === 'buffer') {
    return {
      data: artifact.value,
      type: '.js',
      path: 'bufferData.js'
    };
  }

  if (artifact.artifactType === 'url') {
    return {
      data: await deps.internet.fetch(artifact.value),
      type: stdPath.extname(artifact.value) || '.js',
      path: artifact.value
    };
  }

  const filePath = artifact.value;
  const type = stdPath.extname(filePath);
  return deps.fs.cat(filePath)
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

function getArtifact (fn, declaredPath) {
  if (Buffer.isBuffer(fn.artifact)) {
    return {
      artifactType: 'buffer',
      value: fn.artifact
    };
  }
  const artifactValue = val(fn, 'artifact');
  const urlContext = deps.internet.isUrl(declaredPath);
  const pathResolver = urlContext
    ? deps.internet.path
    : stdPath;
  const resolvedPath = pathResolver.isAbsolute(artifactValue)
    ? artifactValue
    : pathResolver.resolve(
      pathResolver.dirname(declaredPath),
      artifactValue);
  return {
    artifactType: (urlContext ? 'url' : 'file'),
    value: resolvedPath
  };
}
