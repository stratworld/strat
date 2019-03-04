const stdPath = require('path');
const {
  traverse, getConfig, val, line, build
} = require('../../ast');
const ast = require('../../ast');

module.exports = deps => ast => {
  const connectorPaths = getConnectorPaths(ast);
  const events = traverse(ast, ['file', 'service', 'event']);
  events.forEach(event => event.kvp = (event.kvp || [])
    //todo: check if there's a connector property on the event
    // this will cause a bug
    .concat(getConnectorKvp(connectorPaths[val(event, 'name')])));
  return ast;
}

function getConnectorPaths (ast) {
  return traverse(ast, ['file'])
    .filter(file => traverse(file, ['source']).length > 0)
    .reduce((connectorPaths, nextFile) => {
      const source = traverse(nextFile, ['source'])[0];
      const filePath = val(nextFile, 'path');
      const sourceName = val(source, 'name');
      const connector = getConfig(source, 'connector');
      if (connector === undefined) {
        throw {
          error: 'Sources must have a connector property',
          msg: `${filePath} line ${line(source, 'name')}:
Sources must have a connector property`
        };
      }
      connectorPaths[sourceName] = resolve(filePath, connector.value);
      return connectorPaths;
    }, {});
}

function resolve (declaredFile, path) {
  return !stdPath.isAbsolute(path)
    ? stdPath.resolve(stdPath.dirname(declaredFile), path)
    : path;
}

function getConnectorKvp (path) {
  return build('kvp', {
    key: {
      type: 'IDENTIFIER',
      line: 0,
      value: 'connector'
    },
    value: {
      type: 'STRING',
      line: 0,
      value: path
    }
  })
}