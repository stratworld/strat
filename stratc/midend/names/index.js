const { val, traverse, line } = require('../../ast');
const path = require('path');
const policies = [

  // why?
  // fileNameShouldMatchEntity,
  canOnlyIncludeANameOnce,
  namesCanOnlyBeDeclaredOnce,
  shapeNamesHaveBeenDeclared,
  eventsMustHaveBeenIncluded,
  canOnlyReferenceServicesInScope,
  
  //todo: requires refactor of this file
  //referencesPointToRealFunctions
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

// Since declarations are 1:1, file names should be the same as the thing declared
// This assumes only one entity declared per file
// This may be obnoxious for shapes, but the thought is that shapes will be
// attached to a service
// Why make this restriction?
//   -Makes it easier to search for implementations.
//   -Makes includes simpler
//
// This is disabled because it doesn't jive with URL includes, which
// are case insensitive.  Also, we shouldn't break compilation for
// something that may not be under user control.
// We could relax this for URL imports but then whats the point of
// having it at all?
function fileNameShouldMatchEntity (file) {
  const filePath = val(file, 'path');
  const fileName = path.basename(filePath, '.st');
  const entity = traverse(file, ['source|service'])[0];
  if (entity !== undefined) {
    if (val(entity, 'name') !== fileName) {
      throw {
        stratCode: 'E_NAMES_MISMATCH',
        error: 'Naming violation',
        message: `${val(entity, 'name')} should be declared in a file named ${val(entity, 'name')}.st`,
        file: filePath,
        line: line(entity, 'name')
      }
    }
  };
}

// This stinks-- it blocks people from naming their things the same.
// EX: mystuff/Http.st and otherStuff/Http.st will break
// Have to do this because we don't have any namespacing for events/services
// I'm expecting this to not be a huge deal for MVP
// The upside here is it makes includes and using them dramatically simpler
// This is also a restriction that can be lifted later
function canOnlyIncludeANameOnce (file) {
  const topLevelEntities = traverse(file, ['service|source']);

  topLevelEntities.forEach(entity => {
    checkDupNames(traverse(entity, ['include'])
      .concat(topLevelEntities) , val(file, 'path'));  
  })
}

function checkDupNames (entities, filePath) {
  const existingNameTokens = {};
  entities.forEach(entity => {
    const entityPathToken = (entity.tokens.path || entity.tokens.name);
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

function namesCanOnlyBeDeclaredOnce (file) {
  const topLevelEntities = traverse(file, ['service|source']);
  checkDupNames(topLevelEntities, val(file, 'path'));
  topLevelEntities.forEach(entity => {
    checkDupNames(
      traverse(entity, ['include'])
        .concat(traverse(entity, ['function|dispatch', 'functionName']))
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
  return traverse(file, ['service', 'function', 'functionName'])
    .concat(traverse(file, ['service', 'dispatch', 'functionName']));
}

function eventsMustHaveBeenIncluded (file) {
  const includes = traverse(file, ['service', 'include']);
  const events = traverse(file, ['service', 'dispatch', 'event']);
  const includeNames = {};
  includes.forEach(include => {
    const includeName = path.basename(val(include, 'path'), '.st');
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
    const allIncludedServices = traverse(service, ['include'])
      .map(include => path.basename(val(include, 'path'), '.st'))
      .flatmap(includeBaseName => baseNamesToServiceNames[includeBaseName]);

    const servicesInScope = serviceNamesInFile
      .concat(allIncludedServices)
      .constantMapping(true);

    const references = traverse(service, ['dispatch', 'reference']);

    references.forEach(reference => {
      const referenceService = val(reference, 'service');
      if (!servicesInScope[referenceService]) {
        throw {
          stratCode: 'E_NAMES_UNDECLARED',
          msg: `Service ${referenceService} is not included.`,
          file: filePath,
          line: line(reference, 'service')
        }
      }
    });
  });
}
