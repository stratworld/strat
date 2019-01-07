
// to run these tests, copy the traverser class out of baseHttpRouter
const Traverser = require('./traverser');
const whackyTree = {
  "children": {
    "constant": {
      "methods": {
        "get": {
          name: "constant",
          headers: {}
        }
      }
    },
    "square": {
      "children": {
        ":number": {
          "methods": {
            "get": {
              name: "multiplication",
              headers: {}
            }
          }
        }
      }
    },

    //these two are ambiguous -- what to do with GET@/get ??
    //as implemented, we return the first one by order of defnition
    //in the children map:
    //(most likely the order of definition in the source Lit file)
    "get": {
      "methods": {
        'get': {
          name: "constant",
          headers: {}
        }
      }
    },
    ":trickyboi": {
      methods: {
        get: {
          name: "multiplication",
          headers: {}
        }
      }
    }
  },
  "methods": {
    "get": {
      name: "constant",
      headers: { "Content-Type": "text/html" }
    }
  }
};
const notFound = {
  statusCode: 404,
  headers: {},
  isBase64Encoded: false,
  body: "not found",
};

[
  {
    path: '/constant',
    method: 'get',
    result: {
      params: {},
      dependency: {
          name: "constant",
          headers: {}
        }
    }
  },
  {
    path: '/constant/',
    method: 'get',
    result: {
      params: {},
      dependency: {
          name: "constant",
          headers: {}
        }
    }
  },
  {
    path: 'constant',
    method: 'get',
    result: {
      params: {},
      dependency: {
          name: "constant",
          headers: {}
        }
    }
  },
  {
    path: '/constant',
    method: 'post',
    result: notFound
  },
  {
    path: '/square/3',
    method: 'get',
    result: {
      params: {
        "number": "3"
      },
      dependency: {
          name: "multiplication",
          headers: {}
        }
    }
  },
  {
    path: '/square/sef/',
    method: 'get',
    result: {
      params: {
        "number": "sef"
      },
      dependency: {
          name: "multiplication",
          headers: {}
        }
    }
  },
  {
    path: '/square/3/sef',
    method: 'get',
    result: notFound
  },
  {
    path: '/',
    method: 'get',
    result: {
      params: {},
      dependency: {
          name: "constant",
          headers: { "Content-Type": "text/html" }
        }
    }
  },
  {
    path: '',
    method: 'get',
    result: {
      params: {},
      dependency: {
          name: "constant",
          headers: {"Content-Type": "text/html"}
        }
    }
  },
  {
    path: 'get',
    method: 'get',
    result: {
      params: {},
      dependency: {
          name: "constant",
          headers: {}
        }
    }
  },
  {
    path: 'seffo',
    method: 'GET',
    result: {
      params: {trickyboi: 'seffo'},
      dependency: {
          name: "multiplication",
          headers: {}
        }
    }
  }
]
.forEach(testCase => {
  const t = new Traverser(whackyTree);
  const method = testCase.method;
  const path = testCase.path.split('/');
  var i = 0;
  for(; i < path.length; i++) {
    t.advance(path[i]);
  }

  t.method(method);

  const validate = r => JSON.stringify(r) === JSON.stringify(testCase.result)
    ? console.log('pass')
    : console.log(`failed test case ${JSON.stringify(testCase, null, 2)}
got ${JSON.stringify(r)}`)

  t.final()
    .then(validate)
    .catch(validate);
});

