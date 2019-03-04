module.exports = [
  {
    name: 'includes can read another file',
    files: {
      'Backend.st': B(`
service Backend {
  include "./Other"
}
`),
      'Other.st': B(`
service Other {
}
`)
    },
    entry: 'Backend.st'
  }
];
