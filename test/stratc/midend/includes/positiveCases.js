module.exports = [
  {
    name: 'includes can read another file',
    files: {
      'Backend.st': B(`
service Backend {
  include "./Other.st"
}
`),
      'Other.st': B(`
service Other {
}
`)
    },
    entry: 'Backend.st'
  },
  {
    name: 'includes can read another transitive file',
    files: {
      'Backend.st': B(`
service Backend {
  include "./Other.st"
}
`),
      'Other.st': B(`
service Other {
  include "./Another.st"
}
`),
      'Another.st': B('service Another {}')
    },
    entry: 'Backend.st'
  }
];
