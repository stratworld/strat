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

module.exports = [
  {
    name: "thing",
    dispatches: h([
      ["get", "*"]
    ]),
    event: e(["get", "/foo"]),
    result: ok({
      params: {}
    })
  },
  {
    name: "thing2",
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
    name: "thing3",
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
    name: "thing3",
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
];

/* todo:

  make trailing / work
  test different types of path params
  test 404s
  test 405s
  test 500s

*/