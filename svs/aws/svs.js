/*
Disclaimer:

  This was the first large piece of code I built for strat and
  it hasn't gotten the refactor it deserves.

  The longterm vision is to codegen CloudFormation (or SAM [or Terraform])
  configuration and execute that instead of creating resources directly.

  Some code here is oddly generic; that's because this is the salvaged
  backend from a time when stratc deployed things instead of running
  things on a discrete svs.
*/

const stdPath = require('path');
const backend = passify(require('./svs/passes'));

function passify (passTuple) {
  return passTuple
    .map(tuple => {
      return {
        name: tuple[0],
        entry: stdPath.resolve(__dirname, tuple[1])
      };
    });
}

module.exports = async input => {
  let intermediateResult = input;

  for(let i = 0; i < backend.length; i++) {
    intermediateResult
      = await require(backend[i].entry)(intermediateResult);
  }

  return 'Deployment successful';
};
