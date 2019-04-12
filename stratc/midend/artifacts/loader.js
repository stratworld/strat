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
    const functions = traverse(file, ['service', 'function'])
      .concat(traverse(file, ['service', 'dispatch']));
    const filePath = val(file, 'path');
    return Promise.all(functions
      //don't run for functions that already have an artifact made
      //this make this function runnable multiple times
      .filter(fn => fn.artifact === undefined || Buffer.isBuffer(fn.artifact))
      .map(fn => {
        //don't do anything with references
        return traverse(fn, ['reference']).length === 0
          ? resolveArtifact(fn, filePath)
            .then(artifact => {
              fn.artifact = artifact;
            })
          : R();
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

  if (artifact.artifactType === 'string') {
    return {
      data: artifact.value,
      type: '.txt',
      path: 'constant.txt'
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
      path: stdPath.basename(filePath)
    }))
    .catch(e => {
      return J({
        stratCode: 'E_INVALID_ARTIFACT',
        message: `Failed to load file ${filePath}: ${e.message}`,
        file: declaredPath,
        line: line(fn, 'artifact')
      })
    });
}

function getArtifact (fn, declaredPath) {
  if (Buffer.isBuffer(fn.artifact)) {
    return {
      artifactType: 'buffer',
      value: fn.artifact
    };
  }
  const artifactValue = val(fn, 'artifact');
  //everything that is not a relative path is interepreted
  //as a constant string
  if (artifactValue[0] !== '.') {
    return {
      artifactType: 'string',
      value: artifactValue
    };
  }
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
