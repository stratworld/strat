
/*
Service B is in scope for container A if:
  1) it is declared in the same file
  2) it is in a file included by container A

-Additionally for sources-
Service B is in scope for source A if:
  1) any of the above rules apply
  2) Service B includes source A

All sources have access to themselves (scope is reflexive)

In other words, including a service lets you call it,
while including a source lets it call you.  There is no
way to gain access to a source's functions.

Even if you include SUBSTRATE, it does not get included in your scope.
No scopes for Birth, Extern, and SUBSTRATE are created.
Birth and Extern are removed from the AST as they are no longer needed.


The objective of this function is to generate the scope lookup:
  {
    scopeName: {
      containerName: true
    }
  }
*/

const { traverse, val, getName } = require('../../ast');
const ignoreScopes = new Set(['Birth', 'Extern', 'SUBSTRATE']);

module.exports = deps => ast => {
  const containerTuples = traverse(ast, ['file'])
    .flatmap(file => traverse(file, ['source|service'])
      .map(container => [val(file, 'path'), container]));
  const fileToServiceNames = getFileToNameMap(ast, ['service']);
  const fileToContainerNames  = getFileToNameMap(ast, ['service|source']);

  ast.scopes = containerTuples
    .filter(tuple => !ignoreScopes.has(val(tuple[1], 'name')))
    .toMap(tuple => {
      const myFile = fileToContainerNames[tuple[0]];
      const container = tuple[1];
      const name = getName(container);
      const includedFiles = traverse(container, ['body', 'include'])
        .map(include => include.artifact.absolutePath)
        .flatmap(path => fileToServiceNames[path])
        .constantMapping(true)
        .keys();
      const peopleSubedToMe = container.type !== 'source'
        ? []
        : (ast.subscribers[name] || [])
          .map(sub => sub.reference.split('.')[0]);

      return myFile
        .concat(includedFiles)
        .concat(peopleSubedToMe)
        // .concat(name)
        .filter(targetName => !ignoreScopes.has(targetName))
        .constantMapping(true);
    }, tuple => getName(tuple[1]));

  // todo: mutating the ast like this is actually really bad
  removeIgnoreSources(ast);

  return ast;
};

function getFileToNameMap (ast, traversal) {
  return traverse(ast, ['file'])
    .map(file => [
      val(file, 'path'),
      traverse(file, traversal).map(getName)
    ])
    .toMap(t => t[1], t => t[0]);
}

function removeIgnoreSources (ast) {
  traverse(ast, ['file'])
    .forEach(file => {
      file.source = (file.source || [])
        .filter(source => !ignoreScopes.has(getName(source)));
    });
}
