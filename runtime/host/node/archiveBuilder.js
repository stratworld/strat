const Zip = require('adm-zip');
const stdPath = require('path');

/*
The idea here is, the artifact seeds the archive
Subsequent adds will add to that archive
Out of scope: resources / non-zip based archives

artifactObject is:
{
  type: string,
  data: Buffer,
  path: string
}

*/
const ArchiveBuilder = function (artifactObject) {
  this.artifactObject = artifactObject;
  if (artifactObject.type === '.zip') {
    this.zip = new Zip(artifactObject.data);
  } else {
    this.zip = new Zip();
    const fileName = stdPath.basename(artifactObject.path);
    this.zip.addFile(fileName, artifactObject.data);
  }
}

ArchiveBuilder.prototype.addDataAsFile = function (buffer, pathFromRoot) {
  this.zip.addFile(pathFromRoot, buffer);
}

ArchiveBuilder.prototype.copy = function (filePathToCopy, pathFromRoot) {
  this.zip.addLocalFile(filePathToCopy, pathFromRoot);
}

ArchiveBuilder.prototype.data = function () {
  return this.zip.toBuffer();
}

module.exports = ArchiveBuilder;
