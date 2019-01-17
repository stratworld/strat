const stdPath = require('path');
const ArchiveBuilder = require('../../../util/archiveBuilder');
const writeFile = require('util').promisify(require('fs').writeFile);

module.exports = function (ir, filename) {
  const targetName = `${stdPath.basename(filename, '.lit')}.sys`;
  return writeFile(targetName, buildSysArchive(ir))
    .then(() => `Successfully created ${targetName}`);
};

function buildSysArchive (ir) {
  const archive = new ArchiveBuilder();
  (ir.hosts || []).forEach(host => {
    (host.artifacts || []).forEach(artifact => {
      archive.addDataAsFile(
        artifact.data,
        `${artifact.name}/${stdPath.basename(artifact.path)}`);
      delete artifact.data;
    });
  });

  archive.addDataAsFile(Buffer.from(JSON.stringify(ir)), 'ir.json');

  return archive.data();
}
