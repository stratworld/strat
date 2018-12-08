const ast = require('../../ast');
const AST = ast.build;
const traverse = ast.traverse;
const lit = require('../../lit');
const stdPath = require('path');
const fs = require('fs');
const stat = function (pathObj) {
  return require('util').promisify(fs.stat)(pathObj.value);
}

module.exports = function (ir) {
  return traversal(ir);
}

function traversal (ir) {
  const asts = {};

  function executeFrontend (fileName) {
    if (fileName === ir.tokens.path.value) {
      return R(ir);
    }
    return lit('frontend', fileName);
  }

  function traverseDependencyGraph (path) {
    if (asts[path.value] !== undefined) {
      return R();
    }
    return executeFrontend(path.value)
      .then(newIr => {
        asts[path.value] = newIr;
        const edgesOut = traverse(newIr, ['service', 'include', 'tokens', 'path']);
        return Promise.all(edgesOut
          .map(edgePath => resolvePath(edgePath, newIr)
            .then(traverseDependencyGraph)));
      });
  }

  return traverseDependencyGraph(ir.tokens.path)
    .then(() => R(AST('program', {
          root: ir.tokens.path
    }, asts.values())));
}

//todo: add some kind of LITPATH resolution like Go and Node
function resolvePath (path, parentIr) {
  const parentFile = parentIr.tokens.path.value;
  const parentDirectory = stdPath.dirname(parentFile);
  var absolutePath;
  if (!stdPath.isAbsolute(path.value)) {
    absolutePath = stdPath.resolve(parentDirectory, path.value);
  } else {
    absolutePath = path.value;
  }

  if (stdPath.extname(absolutePath) === '') {
    absolutePath = absolutePath + '.lit';
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
