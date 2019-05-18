module.exports = {
  extensions: require('./util/jsExtensions'),
  local: require('./svs/local'),
  archiveBuilder: require('./util/archiveBuilder'),
  compiler: require('./stratc/compiler')
};
