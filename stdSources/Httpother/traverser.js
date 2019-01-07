
//the newline above is important
var Traverser = function (pathTree) {
  //a traversal is a tuple of [params, node_in_tree]
  //this state keeps track of valid traversals
  this.traversals = [[{}, pathTree]];
}

Traverser.prototype.advance = function (token, isMethod) {
  if (token === '' || token === '/') return;
  const subtreeName = isMethod ? 'methods' : 'children';
  var node, params;
  this.traversals = this.traversals.map(traversal => {
    node = traversal[1];
    params = traversal[0];
    if (node[subtreeName] === undefined) {
      return undefined;
    }
    return Object.keys(node[subtreeName])
      .map(childPath => {
        if (childPath === token) {
          return [Object.assign({}, params), childPath];
        }
        if (childPath.indexOf(':') === 0) {
          return [Object.assign(params, {
            [childPath.substr(1)]: token
          }), childPath];
        }
        return undefined;
      })
      .filter(path => path !== undefined)
      .map(newTraversal => [newTraversal[0], node[subtreeName][newTraversal[1]]]);
  })
  .filter(newTraversal => newTraversal !== undefined)
  .reduce((flatMap, nextNewTraversals) => {
    return flatMap.concat(nextNewTraversals);
  }, []);
};

Traverser.prototype.method = function (method) {
  this.advance((method || '').toLowerCase(), true);
};

Traverser.prototype.final = function () {
  const dependency = this.traversals
    .filter(endStep => typeof endStep[1] === 'object'
      && typeof endStep[1].name === 'string')
    [0];
  if (dependency === undefined) {
    return Promise.reject({
      statusCode: 404,
      headers: {},
      isBase64Encoded: false,
      body: "not found",
    });
  }
  return Promise.resolve({
    params: dependency[0],
    dependency: dependency[1]
  });
};

module.exports = Traverser;
