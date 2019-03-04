const ast = require('../../../../stratc/ast');
const traverse = ast.traverse;
const val = ast.val;

module.exports = [
  {
    name: 'creates a name for unnamed resource',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "*"} ->
    "./index.html"
}
`),
    "index.html": B("<h1>foobar</h1>")
    },
    entry: 'Backend.st',
    assertion: didCreateName 
  },
  {
    name: 'creates a name for two event unnamed resource',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "post", path: "*"}
  Http { method: "get", path: "*"} ->
    "./index.html"
}
`),
    "index.html": B("<h1>foobar</h1>")
    },
    entry: 'Backend.st',
    assertion: didCreateName 
  },
  {
    name: 'creates a unique name for unnamed resources',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "*"} ->
    "./index.html"

  Http { method: "post", path: "*"} ->
    "./otherIndex.html"
}
`),
      "index.html": B("<h1>foobar</h1>"),
      "otherIndex.html": B("<h1>foobar</h1>")
    },
    entry: 'Backend.st',
    assertion: function createdUniqueNames (ast, done) {
      const nameSet = traverse(
        ast,
        ['file', 'service', 'dispatch', 'functionName'])
        .map(nameAst => val(nameAst, 'name'))
        .constantMapping(true)
        .keys();
      if (nameSet.length > 1) {
        done();
      } else {
        done(new Error(`Failed to create two unique names.  Names created: ${nameSet.join(', ')}`))
      }
    } 
  }
];

function didCreateName (ast, done) {
  const didBuildName = traverse(
    ast,
    ['file', 'service', 'dispatch', 'functionName'])
      .length > 0;
  if (didBuildName) {
    done();
  } else {
    done(new Error(`Didn't add a functionName AST to unnamed dispatch`));
  }
}
