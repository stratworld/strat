module.exports = [
  {
    entry: 'Backend.st',
    name: 'duplicate function definition',
    files: {
    'Backend.st': B(`
service Backend {
  ddb ():any -> "./ddb.js"
  ddb ():any -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_DUPLICATE'
  },
  {
    entry: 'Backend.st',
    name: 'duplicate function definition with dispatch',
    files: {
    'Backend.st': B(`
service Backend {
  include "Http"

  Http {} ->
    ddb ():any -> "./ddb.js"
  ddb ():any -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_DUPLICATE'
  },
// this was removed from requirements
//   {
//     entry: 'Somethingelse.st',
//     name: 'mismatched file name',
//     files: {
//     'Somethingelse.st': B(`
// service Backend {
//   ddb ():any -> "./ddb.js"
// }
// `)},
//     stratCode: 'E_NAMES_MISMATCH'
//   },
  {
    entry: 'Backend.st',
    name: 'event source not included',
    files: {
    'Backend.st': B(`
service Backend {
  Http {} -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.st',
    name: 'event source not included in source',
    files: {
    'Backend.st': B(`
source Backend {
  Http {} -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.st',
    name: 'shape not declared',
    files: {
    'Backend.st': B(`
service Backend {
  foo (foo):any -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.st',
    name: 'shape not declared in source',
    files: {
    'Backend.st': B(`
source Backend {
  foo (foo):any -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.st',
    name: 'Other service not included',
    files: {
    'Backend.st': B(`
service Backend {
  include "Http"

  Http {} -> Other.other
}
`)},
    stratCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.st',
    name: 'function name conflicts with source include name',
    files: {
    'Backend.st': B(`
service Backend {
  include "Http"
  Http ():any -> "./ddb.js"
}
`)},
    stratCode: 'E_NAMES_DUPLICATE'
  },
];
