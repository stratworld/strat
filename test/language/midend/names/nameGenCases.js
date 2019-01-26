const traverse = require('../../../../language/ast').traverse;

module.exports = [
  {
    name: 'creates a name for unnamed resource',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "*"} ->
    "./index.html"
}
`),
    "index.html": B("<h1>foobar</h1>")
    },
    entry: 'Backend.lit',
    assertion: function (ast, done) {
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
  }
];
