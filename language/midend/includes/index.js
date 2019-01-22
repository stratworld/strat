const ast = require('../../ast');
const AST = ast.build;
const traverse = ast.traverse;
const compile = require('../../compiler').runCommand;
const stdPath = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const stat = function (pathObj) {
  return require('util').promisify(fs.stat)(pathObj.value);
}
const readFile = promisify(fs.readFile);

const stdSources = stdPath.resolve(__dirname, '../../../stdSources');
const litStdPaths = fs.readdirSync(stdSources)
  .reduce((paths, stdModuleName) => {
    paths[stdModuleName] = stdPath.join(stdSources, stdModuleName, `${stdModuleName}.lit`);
    return paths;
  }, {});

module.exports = function (ast) {
  return traversal(ast);
}

function traversal (ast) {
  const asts = {};

  function executeFrontend (fileName) {
    if (fileName === ast.tokens.path.value) {
      return R(ast);
    }
    return readFile(fileName)
      .then(data => compile('frontend', data.toString(), fileName));
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
  return stat(path)
    .then(() => R(path))
    .catch(e => J({
        msg: `File not found
${parentFileName} line ${path.line} ${path.value} not found.`,
        error: e
      }));
}
