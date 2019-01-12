const Zip = require('adm-zip');
const stdPath = require('path');

const ArchiveBuilder = function (artifactObject) {
  if (artifactObject === undefined) {
    this.zip = new Zip();
  } else if (Buffer.isBuffer(artifactObject)) {
    this.zip = new Zip(artifactObject);
  } else {
    if (artifactObject.type === '.zip') {
      this.zip = new Zip(artifactObject.data);
    } else {
      this.zip = new Zip();
      const fileName = stdPath.basename(artifactObject.path);
      this.zip.addFile(fileName, artifactObject.data);
    }
  }
}

ArchiveBuilder.prototype.read = function (filename) {
  return this.zip.getEntries()
    .filter(entry => entry.name === filename)
    .map(foundEntries => foundEntries.getData())
    [0];
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
