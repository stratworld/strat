const ast = require('../../ast');
const AST = ast.build;
const traverse = ast.traverse;
const val = ast.val;
const compilerConstructor = require('../../compiler');
const stdPath = require('path');
const stdSourcesPath = stdPath.resolve(__dirname, '../../../stdSources');

const isUrl = string => {
  const urlRegex = /^(https:|http:\/\/localhost).*/g;
  return urlRegex.test(string);
}

var litStdPaths;
var deps;
module.exports = function (injectedDeps) {
  deps = injectedDeps;
  const stdPathsPromise = deps.fs.ls(stdSourcesPath)
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

async function traversal (ast) {
  const root = val(ast, 'path');
  const asts = {
    [root]: ast
  };

  const traversalStack = [root];

  while (traversalStack.length > 0) {
    const focus = traversalStack.pop();
    const newEdgesOut = traverse(
        asts[focus],
        ['service', 'include'])
      .map(includeAst => val(includeAst, 'path'))
      .filter(edgePath => asts[edgePath] === undefined);

    const resolvedEdges = await Promise.all(
      newEdgesOut
        .map(edgeName => {
          const edgeFileName = getFileName(edgeName, focus);

          return getData(edgeFileName)
            .then(fileData => parseFile(fileData, edgeFileName))
            .then(newAst => R({
              name: edgeFileName,
              ast: newAst
            }));
        })
    );

    resolvedEdges.forEach(newEdge => {
      asts[newEdge.name] = newEdge.ast;
      traversalStack.push(newEdge.name);
    });
  }

  return AST('program', {
    root: root
  }, asts.values());
}

function getFileName (importString, declaredFile) {
  if (isUrl(importString)) return importString;

  const parentDirectory = stdPath.dirname(declaredFile);
  var absolutePath;
  if (litStdPaths[importString]) {
    absolutePath = litStdPaths[importString];
  } else {
    if (!stdPath.isAbsolute(importString)) {
      absolutePath = stdPath.resolve(parentDirectory, importString);
    } else {
      absolutePath = importString;
    }

    if (stdPath.extname(absolutePath) === '') {
      absolutePath = absolutePath + '.lit';
    }
  }

  return absolutePath;
}

async function getData (importString) {
  return isUrl(importString)
    ? deps.internet.fetch(importString)
    : deps.fs.cat(importString);
}

async function parseFile (buffer, fileName) {
  const compile = compilerConstructor(deps).runCommand;
  return compile('frontend', buffer.toString(), fileName);
}
