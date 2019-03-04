const AST = require('../../ast').build;

const anyAst = {
  type: 'shape',
  tokens: {
    name: {
      value: 'any',
      line: 0,
      type: 'IDENTIFIER'
    }
  }
}

function getFunctionNameAst (eventName) {
  return AST('functionName', {
    name: {
      value: `strat_generated_proxy_${eventName}`,
      line: 0,
      type: 'IDENTIFIER'
    }
  }, AST('signature', {}, anyAst, anyAst));
}

module.exports = function (artifact) {
  const ast = AST('function', {}, getFunctionNameAst(artifact.eventName));
  ast.artifact = artifact.data;
  return ast;
}
