
/*
Container B is in scope for container A if:
  1) it is declared in the same file
  2) it is in a file included by container A

The objective of this function is to generate the scope lookup:
  {
    scopeName: {
      containerName: true
    }
  }
*/

const { traverse, val, getName } = require('../../ast');

module.exports = deps => ast => {
  const containerTuples = traverse(ast, ['file'])
    .flatmap(file => traverse(file, ['source|service'])
      .map(container => [val(file, 'path'), container]));
  const containerNamesWithDeclaredFile = traverse(ast, ['file'])
    .map(file => [
      val(file, 'path'),
      traverse(file, ['service|scope']).map(getName)
    ])
    .toMap(t => t[1], t => t[0]);

  ast.scopes = containerTuples
    .toMap(tuple => {
      const myFile = containerNamesWithDeclaredFile[tuple[0]];
      const includedFiles = traverse(tuple[1], ['body', 'include'])
        .map(include => include.artifact.absolutePath)
        .flatmap(path => containerNamesWithDeclaredFile[path])
        .constantMapping(true)
        .keys();

      return myFile
        .concat(includedFiles)
        .constantMapping(true);
    }, tuple => getName(tuple[1]));

  return ast;
};
