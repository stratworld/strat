const compilerConstructor = require('../../compiler');
const { traverse, val, line } = require('../../ast');

module.exports = async (deps, fnName) => {
  async function getStub () {
    const compile = compilerConstructor(deps).runCommand;
    const ast = await compile(
      'ast',
      `service x { ${fnName} ():any -> "./stub.js"}`,
      './stub.st');
    return ast;
  }
  const stub = await getStub();

  return (container, constant) => {
    const stubCopy = Object.assign({}, stub);
    const fnWithConstant = addInfoIntoStub(stubCopy, constant);
    addFunctionIntoContainer(container, fnWithConstant);
  }
};

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
  return `const d = JSON.parse('${JSON.stringify(info).replace(/\\\\/g, '/')}');module.exports = () => d;`;
}
