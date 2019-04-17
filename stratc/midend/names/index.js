const { val, traverse, line } = require('../../ast');
const path = require('path');
const policies = [

  namesCanOnlyBeDeclaredOnce,
  shapeNamesHaveBeenDeclared,
  eventsMustHaveBeenIncluded,
  canOnlyReferenceServicesInScope,
  
  //todo: requires refactor of this file
  //referencesPointToRealFunctions

  //todo: rewrite this file; its pretty ghetto
];

module.exports = () => assertNames;

function assertNames (ast) {
  // policies are read only, synchronous, and throw on violation
  const errors = [];
  policies.forEach(policy => {
    const files = traverse(ast, ['file']);
    files.forEach(file => {
      try {
        policy(file, ast);
      } catch (e) {
        errors.push(e);
      }
    });
  });
  if (errors.length > 0) {
    throw errors;
  }
  return ast;
};

function namesCanOnlyBeDeclaredOnce (file) {
  const topLevelEntities = traverse(file, ['service|source']);
  checkDupNames(topLevelEntities, val(file, 'path'));
  topLevelEntities.forEach(entity => {
    checkDupNames(
      traverse(entity, ['body', 'include'])
        .concat(traverse(entity, ['body', 'function|dispatch', 'functionName']))
      , val(file, 'path'));
  });
}

const allowedShapes = {
  'any': true,
  'void': true
};
function shapeNamesHaveBeenDeclared (file) {
  const filePath = val(file, 'path');
  // todo: shapes
  // any and void are global shapes
  const functions = getFunctions(file);
  functions.forEach(fn => {
    const signature = traverse(fn, []);
    const shapes = traverse(fn, ['signature', 'shape']);
    shapes.forEach(shape => {
      if (!allowedShapes[val(shape, 'name')]) {
        throw {
          stratCode: 'E_NAMES_UNDECLARED',
          message: `${val(shape, 'name')} is undefined.  Only ${allowedShapes
  .keys().map(s => `'${s}'`).join(', ')} are allowed shapes.`,
          file: filePath,
          line: line(shape, 'name')
        }
      }
    })
  });
}

function getFunctions (file) {
  return traverse(file, ['service', 'body', 'function', 'functionName'])
    .concat(traverse(file, ['service', 'body', 'dispatch', 'functionName']));
}

function eventsMustHaveBeenIncluded (file) {
  const includes = traverse(file, ['service', 'body', 'include']);
  const events = traverse(file, ['service', 'body', 'dispatch', 'event']);
  const includeNames = {};
  includes.forEach(include => {
    const includeName = path.basename(include.artifact.absolutePath, '.st');
    includeNames[includeName] = true;
  });

  events.forEach(event => {
    const filePath = val(file, 'path');
    if (!includeNames[val(event, 'name')]) {
      throw {
        stratCode: 'E_NAMES_UNDECLARED',
        message: `Event ${val(event, 'name')} is not included.`,
        file: filePath,
        line: line(event, 'name')
      };
    }
  });
}

function canOnlyReferenceServicesInScope (file, ast) {
  const servicesInFile = traverse(file, ['service']);
  const filePath = val(file, 'path');
  const serviceNamesInFile = servicesInFile.map(service => val(service, 'name'));

  // { basename: [ serviceNames] }
  const baseNamesToServiceNames = traverse(ast, ['file'])
    .filter(file => traverse(file, ['service']).length > 0)
    .reduce((lookup, fileWithServices) => {
      lookup[path.basename(val(fileWithServices, 'path'), '.st')]
        = traverse(fileWithServices, ['service']).map(service => val(service, 'name'));
      return lookup;
    }, {});

  servicesInFile.forEach(service => {
    const allIncludedServices = traverse(service, ['body', 'include'])
      .map(include => path.basename(include.artifact.absolutePath, '.st'))
      .flatmap(includeBaseName => baseNamesToServiceNames[includeBaseName]);

    const servicesInScope = serviceNamesInFile
      .concat(allIncludedServices)
      .constantMapping(true);

    const references = traverse(service, ['body', 'dispatch', 'reference']);

    references.forEach(reference => {
      const referenceService = val(reference, 'service');
      if (!servicesInScope[referenceService]) {
        throw {
          stratCode: 'E_NAMES_UNDECLARED',
          message: `Service ${referenceService} is not included.`,
          file: filePath,
          line: line(reference, 'service')
        }
      }
    });
  });
}


function checkDupNames (entities, filePath) {
  const existingNameTokens = {};
  entities.forEach(entity => {
    var entityPathToken;
    if (entity.artifact !== undefined) {
      entityPathToken = entity.artifact.token;
    } else {
      entityPathToken = entity.tokens.name;
    }
    const entityName = path.basename(entityPathToken.value, '.st');
    if (existingNameTokens[entityName] !== undefined) {
      throw {
        stratCode: 'E_NAMES_DUPLICATE',
        message: `${entityName} is already declared on line ${existingNameTokens[entityName].line}`,
        file: filePath,
        line: entityPathToken.line
      }
    } else {
      existingNameTokens[entityName] = entityPathToken;
    }
  });
}