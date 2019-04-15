module.exports = [
  // builds the AST
  [ 'absolutify', 'midend/includes/absolutify' ],
  [ 'includes', 'midend/includes/index' ],

  //injects things into the AST
  // public is a little low value for MVP and its not really complete
  // [ 'public', 'midend/includes/public' ],
  [ 'namegen', 'midend/names/nameGen' ],

  //match
  //emit
  [ 'inheritance', 'midend/injection/inheritance' ],
  

  //config
  //extern
  //birth


  //works with the AST
  [ 'names', 'midend/names/index'],
  // [ 'loader', 'midend/artifacts/loader'],
  // [ 'libinclude', 'midend/libs/include'],
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
