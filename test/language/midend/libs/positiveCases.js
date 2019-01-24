module.exports = [
  {
    name: 'includes Http',
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
  }
];
