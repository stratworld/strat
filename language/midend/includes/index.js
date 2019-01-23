const ast = require('../../ast');
const AST = ast.build;
const traverse = ast.traverse;
const compilerConstructor = require('../../compiler');
const stdPath = require('path');
const stdSourcesPath = stdPath.resolve(__dirname, '../../../stdSources');

var fs;
var loader;
var litStdPaths;
module.exports = function (deps) {
  fs = deps.fs;
  loader = deps.loader;
  const stdPathsPromise = fs.ls(stdSourcesPath)
    .then(stdModules => stdModules
      .reduce((paths, stdModuleName) => {
        paths[stdModuleName] = stdPath.join(stdSourcesPath, stdModuleName, `${stdModuleName}.lit`);
        return paths;
      }, {}));

  return function (ast, filename) {
    return stdPathsPromise
      .then(result => {
        litStdPaths = result;
        return traversal(ast, filename);
      });
  }
}

function traversal (ast) {
  const asts = {};

  function executeFrontend (fileName) {
    if (fileName === ast.tokens.path.value) {
      return R(ast);
    }
    return fs.cat(fileName)
      .then(data => {
        const compile = compilerConstructor({
          loader: loader,
          fs: fs
        }).runCommand;
        return compile('frontend', data.toString(), fileName);
      });
  }

  function traverseDependencyGraph (path) {
    if (asts[path.value] !== undefined) {
      return R();
    }
    return executeFrontend(path.value)
      .then(newAst => {
        asts[path.value] = newAst;
        const edgesOut = traverse(newAst, ['service', 'include', 'tokens', 'path']);
        return Promise.all(edgesOut
          .map(edgePath => resolvePath(edgePath, newAst)
            .then(traverseDependencyGraph)));
      });
  }

  return traverseDependencyGraph(ast.tokens.path)
    .then(() => R(AST('program', {
          root: ast.tokens.path
    }, asts.values())));
}

//todo: add some kind of LITPATH resolution like Go and Node
function resolvePath (path, parentAst) {
  const parentFile = parentAst.tokens.path.value;
  const parentDirectory = stdPath.dirname(parentFile);
  var absolutePath;
  if (litStdPaths[path.value]) {
    absolutePath = litStdPaths[path.value];
  } else {
    if (!stdPath.isAbsolute(path.value)) {
      absolutePath = stdPath.resolve(parentDirectory, path.value);
    } else {
      absolutePath = path.value;
    }

    if (stdPath.extname(absolutePath) === '') {
      absolutePath = absolutePath + '.lit';
    }
  }
  
  return exists(Object.assign(path, {
    value: absolutePath
  }), parentFile);
}

function exists (path, parentFileName) {
  return fs.stat(path.value)
    .then(() => R(path))
    .catch(e => J({
        msg: `File not found
${parentFileName} line ${path.line} ${path.value} not found.`,
        error: e
      }));
}
