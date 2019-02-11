function h (dispatches) {
  return dispatches
    .map(dispatch => {
      return {
        eventName: "Http",
        eventConfig: {
          method: dispatch[0],
          path: dispatch[1]
        },
        functionName: "Foo.foo",
        isResource: false,
        artifact: "./foo.js"
      }
    });
}

function e (eventTuple) {
  return {
    httpMethod: eventTuple[0],
    path: eventTuple[1]
  };
}

function ok (arg) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    isBase64Encoded: false,
    body: typeof arg === 'string' ? arg : JSON.stringify(arg)
  };
}

function notFound () {
  return {
    statusCode: 404,
    headers: {},
    isBase64Encoded: false,
    body: 'not found'
  };
}

function methodNotAllowed () {
  return {
    statusCode: 405,
    headers: {},
    isBase64Encoded: false,
    body: 'method not allowed'
  };
}

module.exports = [
  {
    name: "",
    dispatches: h([
      ["get", "*"]
    ]),
    event: e(["get", "/foo"]),
    result: ok({
      params: {}
    })
  },
  {
    name: "post",
    dispatches: h([
      ["post", "/foo"]
    ]),
    event: e(["post", "/foo"]),
    result: ok({
      params: {}
    })
  },
  {
    name: "single parameter",
    dispatches: h([
      ["get", "/:foo"]
    ]),
    event: e(["get", "/bar"]),
    result: ok({
      params: {
        foo: 'bar'
      }
    })
  },
  {
    name: "double parameter",
    dispatches: h([
      ["get", "/:foo/:bar"]
    ]),
    event: e(["get", "/bar/baz"]),
    result: ok({
      params: {
        foo: 'bar',
        bar: 'baz'
      }
    })
  },
  {
    name: "prefixed parameter",
    dispatches: h([
      ["get", "/root/:foo"]
    ]),
    event: e(["get", "/root/baz"]),
    result: ok({
      params: {
        foo: 'baz'
      }
    })
  },
  {
    name: "postfixed slash",
    dispatches: h([
      ["get", "/foo/"]
    ]),
    event: e(["get", "/foo"]),
    result: ok({
      params: {}
    })
  },
  {
    name: "star in middle",
    dispatches: h([
      ["get", "/foo/*/bar"]
    ]),
    event: e(["get", "/foo/b/bar"]),
    result: ok({
      params: {}
    })
  },
  {
    name: "not found",
    dispatches: h([
      ["get", "/foo/"]
    ]),
    event: e(["get", "/jimbo"]),
    result: notFound()
  },
  {
    name: "not found param",
    dispatches: h([
      ["get", "/foo/:bar"]
    ]),
    event: e(["get", "/foo"]),
    result: notFound()
  },
  {
    name: "bad method",
    dispatches: h([
      ["get", "/foo"]
    ]),
    event: e(["post", "/foo"]),
    result: methodNotAllowed()
  },
  {
    name: "multiple dispatches",
    dispatches: h([
      ["get", "/foo"],
      ["post", "/foo/bar"],
      ["delete", "/foo"]
    ]),
    event: e(["delete", "/foo"]),
    result: ok({ params: {} })
  },
];
