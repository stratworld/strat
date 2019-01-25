module.exports = [
  {
    name: 'single event to unnamed resource',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "*" } ->
    "./index.html"
}
`),
    'index.html': B(`<h1>test</h1>`)
    },
    entry: 'Backend.lit'
  },
  {
    name: 'multiple events to named resource',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" }
  Http { method: "get", path: "*" } ->
    bleh -> "./index.html"
}
`),
    'index.html': B(`<h1>test</h1>`)
    },
    entry: 'Backend.lit'
  },
  {
    name: 'multiple events to unnamed resource',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" }
  Http { method: "get", path: "*" } ->
    "./index.html"
}
`),
    'index.html': B(`<h1>test</h1>`)
    },
    entry: 'Backend.lit'
  },
  {
    name: 'multiple events to function',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" }
  Http { method: "get", path: "*" } ->
    fn ():any -> "./index.js"
}
`),
    'index.js': B(`module.exports = () => "hello world"`)
    },
    entry: 'Backend.lit'
  },
  {
    name: 'multiple dispatches',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" } ->
    fnOne ():any -> "./index.js"
  
  Http { method: "get", path: "*" } ->
    fnTwo ():any -> "./index.js"
}
`),
    'index.js': B(`module.exports = () => "hello world"`)
    },
    entry: 'Backend.lit'
  },
];
