const ast = require("../../ast");
const traverse = ast.traverse;
const val = ast.val;
const line = ast.line;
const path = require('path');
const policies = [
  fileNameShouldMatchEntity,
  canOnlyIncludeANameOnce,
  namesCanOnlyBeDeclaredOnce,
  shapeNamesHaveBeenDeclared,
  eventsMustHaveBeenIncluded,
  canOnlyReferenceIncludedServices,
  
  //todo: requires refactor of this file
  //referencesPointToRealFunctions
];

module.exports = () => assertNames;

function assertNames (ast) {
  // policies are read only, synchronous, and throw on violation
  policies.forEach(policy => {
    const files = traverse(ast, ['file']);
    files.forEach(file => policy(file));
  });
  return ast;
};

// Since declarations are 1:1, file names should be the same as the thing declared
// This assumes only one entity declared per file
// This may be obnoxious for shapes, but the thought is that shapes will be
// attached to a service
// Why make this restriction?
//   -Makes it easier to search for implementations.
//   -Makes includes simpler
function fileNameShouldMatchEntity (file) {
  const filePath = val(file, 'path');
  const fileName = path.basename(filePath, '.lit');
  const entity = traverse(file, ['source|service'])[0];
  if (entity !== undefined) {
    if (val(entity, 'name') !== fileName) {
      throw {
        errorCode: 'E_NAMES_MISMATCH',
        error: 'Naming violation',
        msg: `${filePath} line ${line(entity, 'name')}
${val(entity, 'name')} should be declared in a file named ${val(entity, 'name')}.lit`
      }
    }
  };
}

// This stinks-- it blocks people from naming their things the same.
// EX: mystuff/Http.lit and otherStuff/Http.lit will break
// Have to do this because we don't have any namespacing for events/services
// I'm expecting this to not be a huge deal for MVP
// The upside here is it makes includes and using them dramatically simpler
// This is also a restriction that can be lifted later
function canOnlyIncludeANameOnce (file) {
  checkDupNames(traverse(file, ['service|source', 'include']), val(file, 'path'));
}

function checkDupNames (entities, filepath) {
  const existingNameTokens = {};
  entities.forEach(entity => {
    const entityPathToken = (entity.tokens.path || entity.tokens.name);
    const entityName = path.basename(entityPathToken.value, '.lit');
    if (existingNameTokens[entityName] !== undefined) {
      throw {
        errorCode: 'E_NAMES_DUPLICATE',
        error: 'Naming violation',
        msg: `${filepath} line ${entityPathToken.line}
${entityName} is already declared on line ${existingNameTokens[entityName].line}`
      }
    } else {
      existingNameTokens[entityName] = entityPathToken;
    }
  });
}

function namesCanOnlyBeDeclaredOnce (file) {
  const functions = getFunctions(file);
  const functionsAndIncludes = functions
    .concat(traverse(file, ['service|source', 'include']))
  checkDupNames(functionsAndIncludes, val(file, 'path'));
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
          errorCode: 'E_NAMES_UNDECLARED',
          error: 'Undeclared shape',
          msg: `${filePath} line ${line(shape, 'name')}
${val(shape, 'name')} is undefined.  Only ${allowedShapes
  .keys().map(s => `'${s}'`).join(', ')} are allowed shapes.`
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
    const includeName = path.basename(val(include, 'path'), '.lit');
    includeNames[includeName] = true;
  });

  events.forEach(event => {
    const filePath = val(file, 'path');
    if (!includeNames[val(event, 'name')]) {
      throw {
        errorCode: 'E_NAMES_UNDECLARED',
        error: 'Undeclared event',
        msg: `${filePath} line ${line(event, 'name')}
Event ${val(event, 'name')} is not included.`
      };
    }
  });
}

function canOnlyReferenceIncludedServices (file) {
  const filePath = val(file, 'path');
  const references = traverse(file, ['service', 'dispatch', 'reference']);
  const includedServices = traverse(file, ['service', 'include'])
    .map(include => path.basename(val(include, 'path'), '.lit'))
    .constantMapping(true);
  references.forEach(reference => {
    const referenceService = val(reference, 'service');
    if (!includedServices[referenceService]) {
      throw {
        errorCode: 'E_NAMES_UNDECLARED',
        error: 'Unincluded service reference',
        msg: `${filePath} line ${line(reference, 'service')}
Service ${referenceService} is not included.`
      }
    }
  });
}
