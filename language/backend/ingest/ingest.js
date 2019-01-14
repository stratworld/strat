const ArchiveBuilder = require('../../../util/archiveBuilder');

module.exports = function (sysFileBuffer) {
  const sysFile = new ArchiveBuilder(sysFileBuffer);
  var ir;
  try {
    ir = JSON.parse(sysFile.read('ir').toString());  
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
          artifact.data = sysFile.read(artifact.name);  
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
