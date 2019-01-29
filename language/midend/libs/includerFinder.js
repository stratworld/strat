const stdPath = require('path');
const ast = require('../../ast');
const traverse = ast.traverse;
const val = ast.val;
const getConfig = ast.getConfig;
const line = ast.line;

module.exports = function (ast) {
  return getFilesWithSource(ast)
    .reduce((lookup, nextFileWithSource) => {
      const sourceName = val(traverse(nextFileWithSource, ['source'])[0], 'name');
      lookup[sourceName] = getIncluder(nextFileWithSource);
      return lookup;
    }, {});
}

function getFilesWithSource (ast) {
  return traverse(ast, ['file'])
    .filter(file => traverse(file, ['source']).length > 0)
}

function getIncluder (fileWithSource) {
  const fileWithSourcePath = val(fileWithSource, 'path');
  const source = traverse(fileWithSource, ['source'])[0];
  const artifactBuilder = getConfig(
    source,
    'artifactBuilder'
  );
  const nameLine = line(source, 'name');

  if (artifactBuilder === undefined) {
    throw {
      error: 'Invalid event source',
      msg: `${fileWithSourcePath} line ${nameLine}
Event sources must supply a 'artifactBuilder' key in their config.`
    };
  }
  const builder = requirePath(fileWithSource, artifactBuilder);
  if (typeof builder !== 'function') {
    throw {
      error: 'Invalid event source',
      msg: `${fileWithSourcePath} line ${nameLine}
Export of ${artifactBuilder.value} is not a function.`
    }
  }
  return builder;
}

function resolvePath (declaredFile, pathStr) {
  const parentDirectory = stdPath.dirname(val(declaredFile, 'path'));
  return !stdPath.isAbsolute(pathStr)
    ? stdPath.resolve(parentDirectory, pathStr)
    : pathStr;
}

function requirePath (declaredFile, pathToken) {
  const absolutePath = resolvePath(declaredFile, pathToken.value);
  try {
    return require(absolutePath);
  } catch (e) {
    throw {
      error: 'File not found',
      msg: `${val(declaredFile, 'path')} line ${pathToken.line}
Failed to load ${pathToken.value}
${e.stack}`
    }
  }
}
