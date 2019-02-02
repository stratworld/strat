require('../util/jsExtensions');
const stdPath = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter();
const fileUtils = require('../util/fileUtils');
const fileSystem = require('../util/fileSystem');
const ArchiveBuilder = require('../util/archiveBuilder');
const docs = stdPath.resolve(__dirname, '../docs');
const markdown = stdPath.resolve(__dirname, './markdown');
const assets = stdPath.resolve(__dirname, './assets');

(async function () {
  const markdownFiles
    = await fileUtils.recursiveLs(markdown);

  const contents = buildContents(markdownFiles);

  try {
    await fileUtils.rimraf(docs);  
  } catch (e) {}

  const indexFiles = await Promise.all(markdownFiles
    .map(transformMarkdown));

  const archive = new ArchiveBuilder();

  indexFiles.forEach(file => {
    archive.addDataAsFile(
      Buffer.from(wrapInTemplate(file.html, contents)),
      stdPath.relative(markdown, file.filePath));
  });

  await archive.copyDirectory(assets);

  archive.files(docs);

  console.log('created docs directory');
})();

async function transformMarkdown (markdownFilePath) {
  const buffer = await fileSystem.cat(markdownFilePath);

  return {
    filePath: markdownFilePath,
    html: converter.makeHtml(buffer.toString())
  };
}

// build out a left side navigation panel
function buildContents (markdownFiles) {
  console.log(markdownFiles)
  return '<h1>div</h1>';
}

function wrapInTemplate (html, contents) {
  return contents + html;
}

// construct a contents from those files
// read those files
  // add contents
  // add seo
  // add header
// remove the docs folder
// build index file
// copy out the readme index files in the same structure
