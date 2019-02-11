const ArchiveBuilder = require('../../../util/archiveBuilder');
const stdPath = require('path');

module.exports = deps => ingest;

function ingest (sysFileBuffer) {
  const sysFile = new ArchiveBuilder(sysFileBuffer);
  var ir;
  try {
    ir = JSON.parse(sysFile.read('ir.json').toString());  
  } catch (e) {
    return J({
      error: 'Invalid .sys file',
      msg: `Could not parse the ir from the sys file. ${e}`,
    });
  }

  try {
    (ir.hosts || []).forEach(host => {
      (host.artifacts || []).forEach(artifact => {
        const error = {
          error: 'Invalid .sys file',
          msg: `Could not open the artifact for ${artifact.name}`
        };
        try {
          artifact.data = sysFile.read(
            stdPath.join(artifact.name, stdPath.basename(artifact.path)));
        } catch (e) {
          throw error;
        }
        if (artifact.data === undefined) {

          throw error;
        }
      });
    });  
  } catch (e) {
    return J(e);
  }
  
  return ir;
};
