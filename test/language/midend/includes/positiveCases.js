module.exports = [
  {
    name: 'includes can read another file',
    files: {
      'Backend.lit': B(`
service Backend {
  include "./Other"
}
`),
      'Other.lit': B(`
service Other {
}
`)
    },
    entry: 'Backend.lit'
  }
];
