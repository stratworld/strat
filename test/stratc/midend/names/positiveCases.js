module.exports = [
  {
    entry: 'Backend.st',
    name: 'names passes a legit file',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"
  Http {} -> http ():void -> "./foobar.js"
  jklsef ():any -> "./ddb.js"
}
`)
    }
  },
  {
    entry: 'Backend.st',
    name: 'names passes a legit file with two services',
    files: {
      'Backend.st': B(`
service Backend {
  include "Http"
  Http {} -> http ():void -> "./foobar.js"
  jklsef ():any -> "./ddb.js"
  Http-> OtherBackend.http

}

service OtherBackend {
  http ():void -> "./foobar.js"
}
`)
    }
  },
  {
    entry: 'Backend.st',
    name: 'names passes a legit file including another service',
    files: {
      'Backend.st': B(`
service Backend {
  include "./Other.st"
  OtherSource {} -> http ():void -> "./foobar.js"
}
`),
      'Other.st': B(`
source OtherSource {}
`)
    }
  }
];