module.exports = [
  {
    entry: 'Backend.lit',
    name: 'names passes a legit file',
    files: {
      'Backend.lit': B(`
service Backend {
  include "Http"
  Http {} -> http ():void -> "./foobar.js"
  jklsef ():any -> "./ddb.js"
}
`)
    }
  }
];