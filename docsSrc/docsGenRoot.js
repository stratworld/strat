require('../util/jsExtensions');
const stdPath = require('path');
const showdown = require('showdown');
const converter = new showdown.Converter();
const fileUtils = require('../util/fileUtils');
const fileSystem = require('../util/fileSystem');
const docs = stdPath.resolve(__dirname, '../docs');
const markdown = stdPath.resolve(__dirname, './markdown');

(async function () {
  const markdownFiles
    = await fileUtils.recursiveLs(markdown);

  await fileUtils.rimraf(docs);

  const indexFiles = await Promise.all(markdownFiles
    .map(transformMarkdown));
})();

async function transformMarkdown (markdownFilePath) {
  const buffer = await fileSystem.cat(markdownFilePath);

  return {
    fileName: markdownFilePath,
    html: converter.makeHtml(buffer.toString())
  };
}

// discover all md files
// construct a reference from those files
// read those files
// map those files to html
  // add reference
  // add seo
  // add header
// remove the docs folder
// build index file
// copy assets (including CNAME file)
// copy out the readme index files in the same structure
