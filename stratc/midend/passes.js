module.exports = [
  // builds the full, normalized AST
  [ 'absolutify', 'midend/includes/absolutify' ],
  [ 'includes', 'midend/includes/traverse' ],

  //injects things into the AST
  // public is a little low value for MVP and its not really complete
  // [ 'public', 'midend/includes/public' ],
  [ 'id', 'midend/id.js'],
  [ 'namegen', 'midend/names/nameGen' ],

  //match
  //emit
  [ 'inheritance', 'midend/injection/inheritance' ],

  //reflection
  [ 'reflection', 'midend/injection/reflection' ],

  //extern
  //birth


  //works with the AST
  [ 'names', 'midend/names/index' ],
  // [ 'libinclude', 'midend/libs/include'],
  // run the loader a second time to load whatever libinclude injected
  // and to load references, which are resolved in libinclude for some reason
  [ 'loader', 'midend/artifacts/loader' ],
  [ 'sysir', 'midend/sys/toSysIr.js' ],

  // works with the sysIR
  [ 'scopereduce', 'midend/hostCollapse/reduceScopes.js' ],
  [ 'collapse', 'midend/hostCollapse/collapse.js' ],
  [ 'sysfile', 'midend/sys/sys.js' ]
];
