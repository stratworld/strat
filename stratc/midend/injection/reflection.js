/*
Goes through every source and service and creates a reflection function
that responds with useful information about the thing's declaration.

Also provides subscriber information for sources.

{
  isAsync: true|false,
  name: serviceName,
  declaredFile: filePath,
  subscribers: [
    pattern: {},
    reference: 'Other.fn'
  ],
  functions: [
    every declared function minus reflect
  ]
}
*/

const { traverse, val, line } = require('../../ast');
const compilerConstructor = require('../../compiler');

module.exports = deps => {

  async function getReflectionStub () {
    const compile = compilerConstructor(deps).runCommand;
    const ast = await compile(
      'ast',
      'service x { reflect ():any -> "./stub.js"}',
      './stub.st');
    return ast;
  }

  return async ast => {
    const reflectionStub = await getReflectionStub();

    traverse(ast, ['file']).forEach(file => {
      const containers = traverse(file, ['service|source']);

      containers.forEach(container => {
        const reflectionInfo = {
          isAsync: val(container, 'async'),
          name: val(container, 'name'),
          declaredFile: val(file, 'path'),
          subscribers: getSubs(container, ast),
          functions: getFunctions(container)
        };

        const stubCopy = Object.assign({}, reflectionStub);

        const reflectionFunction = addInfoIntoStub(stubCopy, reflectionInfo);
        addFunctionIntoContainer(container, reflectionFunction);
      });
    });
    return ast;
  }
};

//todo
function getSubs () { return []; }


//todo: figure out what information should be shown here
//shapes will put stuff here
function getFunctions (container) {
  return traverse(container, ['body', 'function'])
    .map(fn => {
      const fnName = traverse(fn, ['functionName'])[0]
      return {
        name: val(fnName, 'name'),
        line: line(fnName, 'name')
      };
    });
}

function addInfoIntoStub (stub, reflectionInfo) {
  const newArtifact = wrapInfo(reflectionInfo);
  const reflectFn = traverse(stub, ['file', 'service', 'body', 'function'])[0];

  reflectFn.tokens.artifact.value = newArtifact;
  reflectFn.artifact.type = 'text';
  reflectFn.artifact.media = '.js';

  return reflectFn;
}

function addFunctionIntoContainer (container, fn) {
  container.body[0].function = (container.body[0].function || [])
    .concat(fn);
}

function wrapInfo (info) {
  //what a line!
  return `module.exports = () => JSON.parse('${JSON.stringify(info)}');`;
}
