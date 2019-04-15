//injects the std match and std emit functions into sources if
//they do not provide their own.  Sort of like inheritance

const { traverse, val } = require('../../ast');
const compilerFactory = require('../../compiler');
const stdPath = require('path');
const baseSourcePath = stdPath.resolve(__dirname, '../../../std/baseSource/BaseSource.st');
const inheritedFunctions = ['match', 'emit'];

module.exports = deps => async ast => {
  const baseFunctions = await getBaseFunctions(deps);
  const sources = traverse(ast, ['file', 'source']);
  sources.forEach(source => inherit(source, baseFunctions));
  return ast;
}

function inherit (source, baseFunctions) {
  sourceFunctionNames = new Set(traverse(source, ['body', 'function', 'functionName'])
    .concat(traverse(source, ['body', 'dispatch', 'functionName']))
    .map(nameAst => val(nameAst, 'name')));
  baseFunctions.keys().forEach(functionName => {
    if (!sourceFunctionNames.has(functionName)) {
      source.function = (source.function || []).concat(baseFunctions[functionName]);
    }
  });
}

async function getBaseFunctions (deps) {
  const compile = compilerFactory(deps).runCommand;
  const baseSourceData = await deps.fs.cat(baseSourcePath);
  const baseSource = await compile('ast', baseSourceData, baseSourcePath);

  return traverse(baseSource, ['file', 'source', 'body', 'function'])
    .toMap(v => v, ast => val(traverse(ast, ['functionName'])[0], 'name'));
}
