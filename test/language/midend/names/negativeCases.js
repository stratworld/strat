module.exports = [
  {
    entry: 'Backend.lit',
    name: 'duplicate function definition',
    files: {
    'Backend.lit': B(`
service Backend {
  ddb ():any -> "./ddb.js"
  ddb ():any -> "./ddb.js"
}
`)},
    errorCode: 'E_NAMES_DUPLICATE'
  },
  {
    entry: 'Backend.lit',
    name: 'duplicate function definition with dispatch',
    files: {
    'Backend.lit': B(`
service Backend {
  include "Http"

  Http {} ->
    ddb ():any -> "./ddb.js"
  ddb ():any -> "./ddb.js"
}
`)},
    errorCode: 'E_NAMES_DUPLICATE'
  },
  {
    entry: 'Somethingelse.lit',
    name: 'mismatched file name',
    files: {
    'Somethingelse.lit': B(`
service Backend {
  ddb ():any -> "./ddb.js"
}
`)},
    errorCode: 'E_NAMES_MISMATCH'
  },
  {
    entry: 'Backend.lit',
    name: 'event source not included',
    files: {
    'Backend.lit': B(`
service Backend {
  Http {} -> "./ddb.js"
}
`)},
    errorCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.lit',
    name: 'shape not declared',
    files: {
    'Backend.lit': B(`
service Backend {
  foo (foo):any -> "./ddb.js"
}
`)},
    errorCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.lit',
    name: 'Other service not included',
    files: {
    'Backend.lit': B(`
service Backend {
  include "Http"

  Http {} -> Other.other
}
`)},
    errorCode: 'E_NAMES_UNDECLARED'
  },
  {
    entry: 'Backend.lit',
    name: 'function name conflicts with source include name',
    files: {
    'Backend.lit': B(`
service Backend {
  include "Http"
  Http ():any -> "./ddb.js"
}
`)},
    errorCode: 'E_NAMES_DUPLICATE'
  },
];
