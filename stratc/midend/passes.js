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
  [ 'substrate', 'midend/injection/substrate' ],
  [ 'subscribers', 'midend/events/subscribers'],
  [ 'reflection', 'midend/injection/reflection' ],

  //simplifies the AST into the sa IR
  [ 'scope', 'midend/sa/scopes' ],
  [ 'reducescopes', 'midend/hostCollapse/reduceScopes.js' ],
  [ 'hosts', 'midend/sa/hosts' ],

  //create the majordomo function for each host
  [ 'majordomoconfig', 'midend/injection/majordomoConfig' ],
  [ 'majordomo', 'midend/injection/majordomo' ],
  //extern

  //birth ?????

  //clean shit up
  // [ 'saIr', 'midend/sa/saIr' ],

  //print the file
  //[ 'sysfile', 'midend/sys/sys.js' ]
];
