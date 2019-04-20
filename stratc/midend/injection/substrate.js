// inject a couple of substrate references, then
// take all the references to substrate and remake them to
// look like functions on the container
// then remove SUBSTRATE from the AST

const { traverse, val } = require('../../ast');
const compilerFactory = require('../../compiler');
const stdPath = require('path');
const substratePath = stdPath.resolve(__dirname, '../../../std/SUBSTRATE/SUBSTRATE.st');

module.exports = deps => async ast => {
  const substrateFns = await getSubstrateReferenceAsts(deps);
  const containers = traverse(ast, ['file', 'service|source']);

  replaceReferences(containers, substrateFns)
  removeSubstrate(ast);

  return ast;
};

async function getSubstrateReferenceAsts (deps) {
  const compile = compilerFactory(deps).runCommand;
  const substrateData = await deps.fs.cat(substratePath);
  const substrate = await compile('ast', substrateData, substratePath);

  return traverse(substrate, ['file', 'service', 'body', 'function'])
    .map(fn => [fn, val(traverse(fn, ['functionName'])[0], 'name')])
    //rename the actual function into something that won't conflict and
    //the substrate can find and inject
    .map(fnTuple => {
      const fnAst = fnTuple[0];
      const name = fnTuple[1];
      fnAst.functionName[0].tokens.name.value = `$SUBSTRATE-${name}`;
      return fnTuple;
    })
    .toMap(t => t[0], t => t[1]);
}

function replaceReferences (containers, substrateFns) {
  containers.forEach(container => {
    const dispatchesWithRefs = traverse(container, ['body', 'dispatch'])
      .filter(dispatch => traverse(dispatch, ['reference']).length > 0);
    dispatchesWithRefs.forEach(dispatch => {
      const ref = traverse(dispatch, ['reference'])[0];
      const serviceName = val(ref, 'service');
      const functionName = val(ref, 'function');
      if (serviceName === 'SUBSTRATE') {
        //this is awful
        const referencedFn = substrateFns[functionName];
        dispatch.artifact = referencedFn.artifact;
        dispatch.functionName = referencedFn.functionName;
        delete dispatch.reference;
      }
    });
  });
}

function removeSubstrate (ast) {
  //remove substrate includes
  traverse(ast, ['file', 'service|source', 'body'])
    .forEach(body => {
      body.include = (body.include || [])
        .filter(include => val(include, 'artifact') !== 'SUBSTRATE');
    });
  //remove substrate file from the AST
  ast.file = ast.file
    .filter(file => {
      const isFileWithSUBSTRATE = traverse(file, ['service'])
        .map(service => val(service, 'name'))
        .filter(name => name === 'SUBSTRATE')
        [0] === undefined;
      return isFileWithSUBSTRATE;
    });
}
