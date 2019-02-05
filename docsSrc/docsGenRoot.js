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
      getTargetLocation(file.filePath));
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
  return '';
}

function getTargetLocation (filePath) {
  return stdPath.relative(markdown, filePath.replace('.md', '.html'));
}

function wrapInTemplate (html, contents) {
  return `
<head>
  <link href="https://fonts.googleapis.com/css?family=Work+Sans:600" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Work+Sans:800" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Work+Sans" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet">
  <link rel="stylesheet" type="text/css" href="/styles.css">
</head>
<body>
  <div id="header">
    <div>
      <img src="/litplaincrop.png" alt="Lit" height="40">
      <a href="/">Documentation</a>
      <a href="/guides/helloWorld">Guides</a>
      <a href="/guides/install">Install</a>
      <a href="https://github.com/litlang/lit" target="_blank">Source</a>
      <a>Products</a>
    </div>
  </div>
  <div id="content">
    <div id="navigation">${contents}</div>
    <div id="doc">${html}</div>
  </div>
  <div id="footer"></div>
</body>
`;
}

// construct a contents from those files
// read those files
  // add contents
  // add seo
  // add header
// remove the docs folder
// build index file
// copy out the readme index files in the same structure
