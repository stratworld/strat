const ArchiveBuilder = require('../../../util/archiveBuilder');
const stdPath = require('path');

module.exports = deps => ingest;

function ingest (safFileBuffer) {
  const saf = new ArchiveBuilder(safFileBuffer);
  var ir;
  try {
    ir = JSON.parse(saf.read('ir.json').toString());  
  } catch (e) {
    return J({
      error: 'Invalid .saf file',
      msg: `Could not parse the ir from the saf file. ${e}`,
    });
  }

  try {
    (ir.hosts || []).forEach(host => {
      (host.artifacts || []).forEach(artifact => {
        const error = {
          error: 'Invalid .saf file',
          msg: `Could not open the artifact for ${artifact.name}`
        };
        try {
          artifact.data = saf.read(
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
