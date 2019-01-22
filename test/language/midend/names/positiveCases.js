module.exports = [
  {
    filename: 'Backend.lit',
    source: `
service Backend {
  include "Http"
  Http {} -> http ():void -> "./foobar.js"
  jklsef ():any -> "./ddb.js"
}
`
  }
];