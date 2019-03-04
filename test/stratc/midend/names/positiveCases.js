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
  }
];