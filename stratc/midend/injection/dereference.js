const { traverse, val } = require('../../ast');
const compilerFactory = require('../../compiler');

module.exports = deps => async (ast, filename) => {

  //todo: skip SUBSTRATE refs?


  await Promise.all(traverse(ast,
    ['file', 'service|source', 'body', 'dispatch'])
    .filter(dispatch => getRef(dispatch) !== undefined)
    .map(async dispatch => {
      const reference = getRef(dispatch);
      const service = val(reference, 'service');
      const fnName = val(reference, 'function');

      return injectProxy(dispatch, deps, service, fnName, filename)
    }));
  return ast;
}

function getRef (dispatch) {
  return traverse(dispatch, ['reference'])[0];
}

async function injectProxy (dispatch, deps, service, fn, filename) {
  const compile = compilerFactory(deps).runCommand;
  const nameHash = {
    service: service,
    fn: fn,
    filename: filename
  }.hash();
  const name = `anonymous#${nameHash.substr(0,8)}`;

  const stubFile = `service stub {
    ${name} (any):any -> "${getFn(service, fn)}"
  }`;
  const resultAst = await compile('ast', stubFile, filename);

  const fnAst = traverse(resultAst, ['file', 'service', 'body', 'function'])[0];
  dispatch.functionName = fnAst.functionName;
  dispatch.artifact = fnAst.artifact;
  dispatch.artifact.media = '.js';
  delete dispatch.reference;
}

function getFn (service, fn) {
  return `const Strat = require('strat');
module.exports = Strat('${service}.${fn}')`;
}