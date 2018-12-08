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
  eventsMustHaveBeenIncluded
];

module.exports = function (ir) {
  // policies are read only, synchronous, and throw on violation
  policies.forEach(policy => {
    const files = traverse(ir, ['file']);
    files.forEach(file => policy(file));
  });
  return ir;
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
  checkDupNames(functions, val(file, 'path'));
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
    const shapes = traverse(fn, ['shape']);
    shapes.forEach(shape => {
      if (!allowedShapes[val(shape, 'name')]) {
        throw {
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
  return traverse(file, ['service', 'function'])
    .concat(traverse(file, ['service', 'dispatch', 'function']));
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
        error: 'Undeclared event',
        msg: `${filePath} line ${line(event, 'name')}
Event ${val(event, 'name')} is not included.`
      };
    }
  });
}
