module.exports = [
  {
    name: "any",
    pattern: 'any',
    matched: true,
    event: {}
  },
  {
    name: "any get",
    pattern: { method: "get", path: "*" },
    matched: true,
    event: { method: "get", path: "/" }
  },
  {
    name: "not any get",
    pattern: { method: "get", path: "*" },
    matched: false,
    event: { method: "post", path: "/" }
  },
  {
    name: "with params",
    pattern: { method: "get", path: "/:foo" },
    matched: true,
    event: { method: "get", path: "/bar" },
    params: {foo: 'bar'}
  },
  {
    name: "with double params",
    pattern: { method: "get", path: "/:foo/:bar" },
    matched: true,
    event: { method: "get", path: "/1/2" },
    params: {foo: '1', bar: '2'}
  },
  {
    name: "with many methods",
    pattern: { method: "get|post|delete", path: "/:foo/:bar" },
    matched: true,
    event: { method: "post", path: "/1/2" },
    params: {foo: '1', bar: '2'}
  },
  {
    name: "not with many methods",
    pattern: { method: "get|post|delete", path: "/:foo/:bar" },
    matched: false,
    event: { method: "put", path: "/1/2" }
  },
  {
    name: "params with complicated path",
    pattern: { method: "get", path: "/:foo/*/stuff/:bar/other" },
    matched: true,
    event: { method: "get", path: "/1/sef/sef/s/e/sss/e/stuff/2/other" },
    params: {foo: '1', bar: '2'}
  },
  {
    name: "404",
    pattern: 404,
    matched: true,
    event: {status: 404, error: {}}
  },
  {
    name: "404 string",
    pattern: "404",
    matched: true,
    event: {status: 404}
  },
  {
    name: "500",
    pattern: 500,
    matched: true,
    event: {status: 500}
  },
];