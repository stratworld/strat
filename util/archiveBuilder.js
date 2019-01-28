const Zip = require('adm-zip');
const stdPath = require('path');
const fs = require('fs');
const ls = fs.readdirSync;
const isDirectory = file => fs.statSync(file).isDirectory();
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
  return this.zip.getEntries()
    .filter(entry => entry.entryName === filename)
    .map(foundEntries => foundEntries.getData())
    [0];
}

ArchiveBuilder.prototype.addDataAsFile = function (buffer, pathFromRoot) {
  this.zip.addFile(pathFromRoot, buffer);
}

ArchiveBuilder.prototype.copyDirectory = function (absoluteDirectoryPath, pathFromRoot) {
  if (!isDirectory(absoluteDirectoryPath)) {
    throw 'non directory supplied to copyDirectory';
  }
  recursiveLs(absoluteDirectoryPath)
    .forEach(filePath => {
      this.copy(
        filePath,
        stdPath.join((pathFromRoot || ''),
          stdPath.relative(absoluteDirectoryPath, filePath)));
    });
}

ArchiveBuilder.prototype.copy = function (filePathToCopy, pathFromRoot) {
  this.zip.addFile(pathFromRoot, cat(filePathToCopy));
}

ArchiveBuilder.prototype.data = function () {
  //this.zip.writeZip(stdPath.resolve(process.cwd(), 'out.zip'));
  return this.zip.toBuffer();
}

function recursiveLs (absoluteDirectoryPath) {
  const files = [];
  const stack = [absoluteDirectoryPath];
  var focus;
  while(stack.length > 0) {
    focus = stack.pop();
    if (isDirectory(focus)) {
      ls(focus)
        .forEach(fileName => {
          stack.push(stdPath.resolve(focus, fileName));
        });
    } else {
      files.push(focus);
    }
  }

  return files;
}

module.exports = ArchiveBuilder;
