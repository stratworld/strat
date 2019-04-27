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

const injectFactory = require('./injectConstantFunction');
const { traverse, val, line } = require('../../ast');

module.exports = deps => async ast => {
  await Promise.all(traverse(ast, ['file']).map(async file => {
    const containers = traverse(file, ['service|source']);

    await Promise.all(containers.map(async container => {
      const inject = await injectFactory(deps, 'reflect');
      const reflectionInfo = {
        isAsync: val(container, 'async'),
        name: val(container, 'name'),
        declaredFile: val(file, 'path'),
        subscribers: getSubs(container, ast.subscribers),
        functions: getFunctions(container)
      };

      inject(container, reflectionInfo);
    }));
  }));
  return ast;
};

function getSubs (container, subscribers) {
  const name = val(container, 'name');
  return subscribers[name] || [];
}

//todo: figure out what information should be shown here
//shapes will put stuff here
function getFunctions (container) {
  return traverse(container, ['body', 'function'])
    .map(fn => {
      const fnName = traverse(fn, ['functionName'])[0]
      return {
        name: val(fnName, 'name'),
        line: line(fnName, 'name'),
        media: fn.artifact.media,
        isResource: fn.artifact.isResource
      };
    });
}
