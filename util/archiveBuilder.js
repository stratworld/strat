const Zip = require('adm-zip');
const stdPath = require('path');
const recursiveLs = require('./fileUtils').recursiveLs;
const isDirectory = require('./fileUtils').isDirectory;
const fs = require('fs');
const cat = fs.readFileSync;

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
  const unWindowsdPath = filename.replace('\\', '/');
  return this.zip.getEntries()
    .filter(entry => entry.entryName === unWindowsdPath)
    .map(foundEntries => foundEntries.getData())
    [0];
}

ArchiveBuilder.prototype.addDataAsFile = function (buffer, pathFromRoot) {
  if (this.zip.getEntries()
    .filter(entry => entry.entryName === pathFromRoot)
    [0] === undefined) {
    this.zip.addFile(pathFromRoot, buffer);
  }
}

ArchiveBuilder.prototype.copyDirectory = function (absoluteDirectoryPath, pathFromRoot) {
  return isDirectory(absoluteDirectoryPath)
    .then(directory => {
      return !directory
        ? J('non directory supplied to copyDirectory')
        : recursiveLs(absoluteDirectoryPath);
    })
    .then(files => {
      files
        .forEach(filePath => {
          this.copy(
            filePath,
            stdPath.join((pathFromRoot || ''),
              stdPath.relative(absoluteDirectoryPath, filePath)));
        });
      return R();
    });
}

ArchiveBuilder.prototype.copy = function (filePathToCopy, pathFromRoot) {
  this.zip.addFile(pathFromRoot, cat(filePathToCopy));
}

ArchiveBuilder.prototype.files = function (destinationDirectory) {
  this.zip.extractAllTo(destinationDirectory);
}

ArchiveBuilder.prototype.data = function () {
  //this.zip.writeZip(stdPath.resolve(process.cwd(), 'out.zip'));
  return this.zip.toBuffer();
}

module.exports = ArchiveBuilder;
