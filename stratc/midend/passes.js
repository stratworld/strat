module.exports = [
  // works with the AST
  [ 'includes', 'midend/includes/index' ],
  [ 'public', 'midend/includes/public' ],
  [ 'names', 'midend/names/index'],
  [ 'namegen', 'midend/names/nameGen'],
  [ 'loader', 'midend/artifacts/loader'],
  [ 'libinclude', 'midend/libs/include'],
  // run the loader a second time to load whatever libinclude injected
  // and to load references, which are resolved in libinclude for some reason
  [ 'loader', 'midend/artifacts/loader'],
  [ 'id', 'midend/id.js'],
  [ 'sysir', 'midend/sys/toSysIr.js'],

  // works with the sysIR
  [ 'scopereduce', 'midend/hostCollapse/reduceScopes.js'],
  [ 'collapse', 'midend/hostCollapse/collapse.js'],
  [ 'sysfile', 'midend/sys/sys.js']
];
