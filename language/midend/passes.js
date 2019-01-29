module.exports = [
  // works with the AST
  [ 'includes', 'midend/includes/index'],
  [ 'names', 'midend/names/index'],
  [ 'namegen', 'midend/names/nameGen'],
  [ 'libinclude', 'midend/libs/include'],
  [ 'connector', 'midend/libs/connector'],
  [ 'loader', 'midend/artifacts/loader'],
  [ 'id', 'midend/id.js'],
  [ 'sysir', 'midend/sys/toSysIr.js'],

  // works with the sysIR
  [ 'collapse', 'midend/hostCollapse/collapse.js'],
  [ 'sysfile', 'midend/sys/sys.js']
];
