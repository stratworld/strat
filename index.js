//this file is used to expose pieces of
//stratc to consumers that use stratc as a library

module.exports = {
  extensions: require('./util/jsExtensions'),
  local: require('./svs/local'),
  archiveBuilder: require('./util/archiveBuilder')
}