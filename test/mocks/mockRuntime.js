
// not sure if this works!

const fs = require('fs');
const nodeEval = require('node-eval');
//takes something (script location, override strat deps, ...)
//returns the function as it would be called within the Strat runtime
module.exports = function (thing) {
  const fileData = (fs.readFileSync(thing.scriptPath)).toString();
  const injected = fileData.replace(/require\('strat'\)/g, getInejectedStrat());
    
  function getInejectedStrat () {
    return '(function () { return x => x })()'
  }
  return nodeEval(injected, './fileUnderTest.js')
};
