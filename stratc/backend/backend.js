const ArchiveBuilder = require('../../util/archiveBuilder');
const runtimeBuilder = require('./buildRuntime');
const rimraf = require('../../util/fileUtils').rimraf;
const stdPath = require('path');
const ServerlessFramework = require('../../node_modules/serverless/lib/Serverless');

module.exports = deps => async (file, fileName) => {
  await rimraf(stdPath.resolve('./.build'));
  const archive = new ArchiveBuilder(file);
  const hosts = JSON.parse(archive.read('hosts.json'))
  const bundles = hosts.values().map(host => runtimeBuilder(host, archive));
  bundles[0].files('./.build');
  process.chdir('./.build');

  // lol
  process.argv = process.argv.slice(0, 3);

  const sf = new ServerlessFramework();
  await sf.init();
  await sf.run();
};
