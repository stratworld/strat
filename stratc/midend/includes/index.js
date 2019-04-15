const { build, traverse, val } = require('../../ast');
const compilerConstructor = require('../../compiler');

var deps;
module.exports = function (injectedDeps) {
  deps = injectedDeps;

  return traversal;
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
        ['service|source', 'body', 'include'])
      .map(includeAst => includeAst.artifact)
      .filter(artifactInfo =>
        asts[artifactInfo.absolutePath] === undefined);

    const resolvedEdges = await Promise.all(
      newEdgesOut
        .map(artifactInfo => {
          if (artifactInfo.type === 'text') {
            throw {
              stratCode: 'E_INVALID_INCLUDE',
              message: `The include text ${artifactInfo.token.value} is neither a file nor a URL.`,
              file: artifactInfo.declaredFile,
              line: artifactInfo.token.line
            }
          }
          const context = artifactInfo.type === 'url'
            ? deps.internet
            : deps.fs;
          return getData(artifactInfo, context)
            .then(fileData => parseFile(fileData, artifactInfo.absolutePath))
            .then(newAst => R({
              absolutePath: artifactInfo.absolutePath,
              ast: newAst
            }));
        })
    );

    resolvedEdges.forEach(newEdge => {
      asts[newEdge.absolutePath] = newEdge.ast;
      traversalStack.push(newEdge.absolutePath);
    });
  }

  return build('program', {
    root: root
  }, asts.values());
}

async function getData (artifact, context) {
  return context.cat(artifact.absolutePath)
    .catch(e => {
      throw {
        stratCode: 'E_NO_ENTITY',
        message: `Unable to load ${artifact.token.value} as ${artifact.absolutePath}`,
        file: artifact.declaredFile,
        line: artifact.token.line
      };
    });
}

async function parseFile (buffer, fileName) {
  const compile = compilerConstructor(deps).runCommand;
  const frontendAst = compile('frontend', buffer.toString(), fileName);
  return compile('absolutify', frontendAst, fileName);
}
