module.exports = [
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  ddb ():any -> "./ddb.js"
  ddb ():any -> "./ddb.js"
}
`,
    code: 'E_NAMES_DUPLICATE'
  },
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  include "Http"

  Http {} ->
    ddb ():any -> "./ddb.js"
  ddb ():any -> "./ddb.js"
}
`,
    code: 'E_NAMES_DUPLICATE'
  },
  {
    filename: 'Somethingelse.lit',
    source: `
service Backend {
  ddb ():any -> "./ddb.js"
}
`,
    code: 'E_NAMES_MISMATCH'
  },
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  Http {} -> "./ddb.js"
}
`,
    code: 'E_NAMES_UNDECLARED'
  },
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  foo (foo):any -> "./ddb.js"
}
`,
    code: 'E_NAMES_UNDECLARED'
  },
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  include "Http"

  Http {} -> Other.other
}
`,
    code: 'E_NAMES_UNDECLARED'
  },
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  include "Http"
  Http ():any -> "./ddb.js"
}
`,
    code: 'E_NAMES_DUPLICATE'
  },
];
