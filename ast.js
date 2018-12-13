module.exports = {
  build: function (nodeType, tokens, ...children) {
    const thisNode = {
      type: nodeType,
      tokens: tokens
    };
    (children || [])
    .flat()
    .purge()
    .forEach(child => {
      const childType = child.type;
      if (thisNode[childType] === undefined) {
        thisNode[childType] = [];
      }
      thisNode[childType].push(child);
    });

    return thisNode;
  },
  traverse: traverse,
  val: val,
  line: (node, key) => tokenDive(node, key, 'line'),
  getConfig: (node, key) => traverse(node, ['kvp'])
    .filter(kvp => tokenDive(kvp, 'key', 'value') === key)
    .map(kvp => kvp.tokens.value)
    [0],
  resolve: (program, includes) => {
    const pathMap = traverse(program, ['file'])
      .reduce((map, file) => {
        map[val(file, 'path')] = file;
        return map;
      }, {});
    return includes
      .map(include => val(include, 'path'))
      .map(path => pathMap[path])
  },
  resolveFunction: (program, functionName) => {
    const tokens = functionName.split('-');
    const serviceName = tokens[0];
    const localFunctionName = tokens[1];
    return traverse(program, ['file', 'service'])
      .filter(service => val(service, 'name') === serviceName)
      .flatmap(foundService => traverse(foundService, ['function'])
        .concat(traverse(foundService, ['dispatch', 'function'])))
      .filter(fn => val(fn, 'name') === localFunctionName)
      [0];
  }
};

// This encodes a mini ast traversal language:
// path ->
//    chunk*
// chunk ->
//    type(|type)*
// type ->
//    STRING
//
// The goal is given an AST node, give all nodes that
// can be found along the given path of types.
// EX: to get all includes for each file from a program AST:
//  traverse(program, ['file', 'service|source', 'include']);
//
// TODO: this language should be encapsulated within this file*
// I can't figure out how to do that while allowing custom traversals
// *this function leaks grammar information to people who shouldn't care
function traverse (node, path) {
  return (path || [])
    .purge()
    .reduce((traversals, nextChunk) =>
      traversals
        .flatmap(focus => nextChunk.split('|')
          .flatmap(typeOption => focus[typeOption]))
        .purge()
    , [(node || {})]);
}

function tokenDive (node, key, prop) {
  return key === undefined || node.tokens[key] === undefined
      ? undefined
      : node.tokens[key][prop];
}

function val (node, key) {
  return tokenDive(node, key, 'value');
}
