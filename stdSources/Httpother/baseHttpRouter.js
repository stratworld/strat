
module.exports = function (event) {
  const method = event.httpMethod;
  const t = new Traverser(tree);
  const path = (event.path || '')
    .split('/');

  path.forEach(p => t.advance(p));
  t.method(method);

  return t.final()
    .then(traversalResult => {
      var body = undefined;
      try {
        body = method === 'get' || event.body === undefined
          ? undefined
          : JSON.parse(event.body);
      } catch (e) {
        return Promise.reject({
          statusCode: 400,
          headers: {},
          isBase64Encoded: false,
          body: `invalid json input: ${e}`
        });
      }
      return Lit(traversalResult.dependency.name)({
        body: body,
        params: traversalResult.params
      })
      .then(response => Promise.resolve({
        statusCode: 200,
        headers: traversalResult.dependency.headers,
        isBase64Encoded: false,
        body: typeof response === 'string' ? response : JSON.stringify(response),
      }))
      .catch(e => {
        return Promise.resolve({
          // if we didn't like it its a bad request!
          // could 500 here, but that's a little dramatic
          // its not me, its you!
          statusCode: 400,
          headers: {},
          isBase64Encoded: false,
          body: e
        })
      });
    })
    .catch(e => Promise.resolve(e));
};
