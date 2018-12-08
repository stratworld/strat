const path = require('path');
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

const nodeRuntime = AST('kvp', {
  key: {
    value: 'runtime',
    line: 0,
    type: 'IDENTIFIER'
  },
  value: {
    value: 'node',
    line: 0,
    type: 'IDENTIFIER'
  }
})

// Takes an artifact and returns a function AST
module.exports = function (artifact) {
  const baseName = path.basename(artifact).split('.')[0];
  return AST('function', {
    name: {
      value: `lit_generated_${baseName}`,
      line: 0,
      type: 'IDENTIFIER'
    }
  }, AST('kvp', {
    key: {
      value: 'artifact',
      line: 0,
      type: 'IDENTIFIER'
    },
    value: {
      value: artifact,
      line: 0,
      type: 'IDENTIFIER'
    }
  }), nodeRuntime, anyAst, anyAst);
}
