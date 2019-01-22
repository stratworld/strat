module.exports = [
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  ddb (foo):any -> "./ddb.js"
  ddb (foo):any -> "./ddb.js"
}
`,
    code: 'E_NAMES_DUPLICATE'
  }
];