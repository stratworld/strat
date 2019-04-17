module.exports = [
  // builds the full, normalized AST
  [ 'absolutify', 'midend/includes/absolutify' ],
  [ 'includes', 'midend/includes/traverse' ],

  //brief check of AST
  [ 'names', 'midend/names/index' ],

  //injects things into the AST
  [ 'id', 'midend/id.js'],
  [ 'namegen', 'midend/names/nameGen' ],

  //add std functions
  [ 'inheritance', 'midend/injection/inheritance' ],
  [ 'subscribers', 'midend/events/subscribers'],
  [ 'reflection', 'midend/injection/reflection' ],

  //works with the AST
  // [ 'loader', 'midend/artifacts/loader' ],
  [ 'sysir', 'midend/sys/toSysIr.js' ],

  // works with the sysIR
  //extern
  //birth
  [ 'scopereduce', 'midend/hostCollapse/reduceScopes.js' ],
  [ 'collapse', 'midend/hostCollapse/collapse.js' ],
  [ 'sysfile', 'midend/sys/sys.js' ]
];
