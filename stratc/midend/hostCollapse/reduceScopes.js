module.exports = deps => ir => {
  const redundantScopes = findRedundantScopes(ir.scopes);

  ir.scopes.keys().forEach(scopeName => {
    if (redundantScopes[scopeName]) {
      delete ir.scopes[scopeName];
    }
  });
  ir.movedScopes = redundantScopes;
  return ir;
};

// returns { scopeName: firstTimeWeSawThisScope }
function findRedundantScopes (scopes) {
  const redundantScopes = {};
  const redundantToOriginal = {};
  const scopeNames = scopes.keys();

  for(var i = 0; i < scopeNames.length; i++) {
    if (!redundantScopes[scopeNames[i]]) {
      for(var j = i+1; j < scopeNames.length; j++) {
        var L = scopes[scopeNames[i]];
        var R = scopes[scopeNames[j]];
        var intersectionLength = L.intersect(R).keys().length;
        if (intersectionLength === L.keys().length
          && intersectionLength === R.keys().length) {
          redundantToOriginal[scopeNames[j]] = scopeNames[i];
          redundantScopes[scopeNames[j]] = true;
        }
      }
    }
  }

  return redundantToOriginal;
}