module.exports = [
  {
    name: 'single event to unnamed resource',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "*" } ->
    "./index.html"
}
`),
    'index.html': B(`<h1>test</h1>`)
    },
    entry: 'Backend.st'
  },
  {
    name: 'multiple events to named resource',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" }
  Http { method: "get", path: "*" } ->
    bleh -> "./index.html"
}
`),
    'index.html': B(`<h1>test</h1>`)
    },
    entry: 'Backend.st'
  },
  {
    name: 'multiple events to unnamed resource',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" }
  Http { method: "get", path: "*" } ->
    "./index.html"
}
`),
    'index.html': B(`<h1>test</h1>`)
    },
    entry: 'Backend.st'
  },
  {
    name: 'multiple events to function',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"

  Http { method: "get", path: "bleh" }
  Http { method: "get", path: "*" } ->
    fn ():any -> "./index.js"
}
`),
    'index.js': B(`module.exports = () => "hello world"`)
    },
    entry: 'Backend.st'
  },
  {
    name: 'multiple dispatches',
    files: {
      'Backend.st': B(`
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
    entry: 'Backend.st'
  },
  {
    name: 'reference to other service function',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"
  include "./Other"

  Http { method: "get", path: "bleh" } -> Other.other
}
`),
      'Other.st': B(`
service Other {
  other ():any -> "./index.js"
}`),
      'index.js': B(`module.exports = () => "hello world"`)
    },
    entry: 'Backend.st'
  },
];
