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

  const contents = buildContents(markdownFiles
    .map(filepath => stdPath.relative(markdown, filepath))
    .filter(file => file !== 'index.md'));

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
  const struct = markdownFiles
    .sort()
    .reduce((struct, nextFile) => {
      const parts = nextFile.split('/');
      const directory = parts[0];
      const fileName = stdPath.basename(parts[1], '.md');
      const link = `/${nextFile.replace('.md', '')}`;
      if (struct[directory] === undefined){
        struct[directory] = [];
      }
      struct[directory].push({
        name: fileName,
        link: link
      });
      return struct;
    }, {});

  return struct
    .keys()
    .map(directoryName => `
    <div class="group">
    <strong>${directoryName}</strong>
      <div>${createChildLinks(struct[directoryName])}</div>
    </div>`)
    .join('');
}

function createChildLinks (childrenLinks) {
  return (childrenLinks || [])
    .map(child => `<a class="nav-page" href="${child.link}">${child.name}</a>`)
    .join('');
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
  <div id="navbar" class="navigation">
    <div id="logo">Strat</div>
    <a href="">Documentation</a>
    <a href="">Install</a>
    <a href="">Roadmap</a>
    <a href="">Source</a>
    <a class="stratosphere" href="">Stratosphere</a>
    <a href="">Contact</a>
  </div>
  <div class="row">
    <div id="menu" class="navigation">${contents}</div>
    <div id="document">${html}</div>
  </div>
  <div id="footer" class="row navigation">
    <a>contact</a>
    <a>contact</a>
    <a>contact</a>
    <a>contact</a>
    <a>contact</a>
    <a>contact</a>
  </div>
</body>
`;
}


/*
<body>
  <div id="header">
    <div>
      <a href="/">Documentation</a>
      <a href="/Guides/Getting%20Started">Install</a>
      <a href="/Features/Roadmap">Roadmap</a>
      <a href="https://github.com/litlang/lit" target="_blank">GitHub</a>
      <a>Stratosphere</a>
    </div>
  </div>
  <div id="content">
    <div id="navigation">
      <div id="navigation-links">
        ${contents}
      </div>
    </div>
    <div id="contact-us">
      <strong>Help -></strong>
      <a href="mailto:support@lit.build">support@lit.build</a>
      <strong>Feature Requests -></strong>
      <a href="mailto:interest@lit.build">interest@lit.build</a>
    </div>
    <div id="doc">${html}</div>
  </div>
  <div id="footer"></div>
</body>
*/