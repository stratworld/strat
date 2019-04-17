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

  //simplifies the AST into the sa IR
  [ 'scope', 'midend/sa/scopes' ],
  [ 'saIr', 'midend/sa/saIr' ],

  // works with the sa IR
  //extern
  //birth
  [ 'scopereduce', 'midend/hostCollapse/reduceScopes.js' ],
  [ 'collapse', 'midend/hostCollapse/collapse.js' ],
  [ 'sysfile', 'midend/sys/sys.js' ]
];
