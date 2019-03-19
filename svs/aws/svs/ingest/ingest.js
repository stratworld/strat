const ArchiveBuilder = require('../../../../util/archiveBuilder');
const stdPath = require('path');

module.exports = ingest;

function ingest (saFileBuffer) {
  const sa = new ArchiveBuilder(saFileBuffer);
  var ir;
  try {
    ir = JSON.parse(sa.read('ir.json').toString());  
  } catch (e) {
    return J({
      error: 'Invalid .sa file',
      msg: `Could not parse the ir from the sa file. ${e}`,
    });
  }

  try {
    (ir.hosts || []).forEach(host => {
      (host.artifacts || []).forEach(artifact => {
        const error = {
          error: 'Invalid .sa file',
          msg: `Could not open the artifact for ${artifact.name}`
        };
        try {
          artifact.data = sa.read(
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
