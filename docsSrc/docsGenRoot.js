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
    const fileName = getName(file.filePath);
    archive.addDataAsFile(
      Buffer.from(wrapInTemplate(file.html, contents, getFolder(fileName, file.filePath), fileName)),
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

function getName (filePath) {
  const basename = stdPath.basename(filePath, '.md');
  if (basename === 'index') {
    return "Introduction";
  }
  return basename;
}

function getFolder (name, filePath) {
  if (name === 'Introduction') return "";
  return stdPath.basename(filePath.replace(`/${name}.md`, '')) + ':';
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
    <div  class="heading">${directoryName}</div>
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

function wrapInTemplate (html, contents, folder, name) {
  return `
<head>
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-144564870-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-144564870-1');
  </script>
  <title>${folder} ${name} | Strat Documentation</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Work+Sans:600" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Work+Sans:800" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Work+Sans" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet">
  <link rel="stylesheet" type="text/css" href="/styles.css">
</head>
<body>
  <div id="navbar" class="navigation">
    <div id="logo">Strat</div>
    <a href="/" class="heading">Documentation</a>
    <a href="/Guides/Getting%20Started" class="heading">Install</a>
    <a href="/Features/Roadmap" class="heading">Roadmap</a>
    <a href="https://github.com/stratworld/strat" target="_blank" class="heading">Source</a>
    <a class="stratosphere heading" href="/Stratosphere.html">Stratosphere</a>
    <a href="/Contact/Contact" class="heading">Contact</a>
  </div>
  <div class="row">
    <div id="menu" class="navigation">${contents}</div>
    <div id="document">${html}</div>
  </div>
  <div id="footer" class="row navigation">
    <a class="navigation" href="mailto:interest@strat.world">interest@strat.world</a>
    <a class="navigation" href="mailto:help@strat.world">help@strat.world</a>
  </div>
</body>
`;
}
