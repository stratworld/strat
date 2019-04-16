// Track down everywhere that has a relative path, make it absolute
// and document what it is; how to download it

/*
Possible references:
  Relative file path: ./foo.js
  STD path: Http
  Absolute URL: https://stratosphere.world/foo.st
  Relative URL: ./client.js (within a file downloaded from an absolute URL)

Note: relative paths must start with a .

Note: artifacts that are not a:
  Relative file path
  Relative URL path
  Absolute URL
are interpreted as inline text resources

References can appear within:
  Artifacts
    service|source, function
    service|source, dispatch, function
  Includes
    service|source, include

Everywhere above will be normalized into the following interface:

{
  token: the token for the string
  absolutePath: the absolutified path
  type: url|file|buffer
  declaredFile: the file it was declared in
  media: js|html|java .etc (the file extension)
}
*/

const { val, traverse } = require('../../ast');
const relativePathToStd = '../../../std';

module.exports = deps => async fileAst => {

  const file = val(fileAst, 'path');

  const stdNames = await getStdNames(deps.fs);

  const references = traverse(fileAst,
    ['service|source', 'body', 'function|dispatch|include']);

  const absolutifier = getAbsolutifier(file, fileAst, deps, stdNames);
  
  references.forEach(absolutifier);

  return fileAst;
};

function getAbsolutifier (declaredFile, ast, deps, stdNames) {
  const isUrlContext = deps.internet.isUrl(declaredFile)
  const context = isUrlContext ? deps.internet : deps.fs;
  return function (nodeAst) {
    const artifactText = val(nodeAst, 'artifact');
    const isArtifactUrl = deps.internet.isUrl(artifactText);
    const path = absolutify(
      declaredFile,
      artifactText,
      context,
      stdNames);
    const isText = path === false;
    nodeAst.artifact = {
      token: nodeAst.tokens.artifact,
      declaredFile: declaredFile,
      absolutePath: path,
      type: isText ? 'text' : isArtifactUrl ? 'url' : 'file',
      media: isText ? '.txt' : context.path.extname(path)
    };
  }
}

function absolutify(declaredFile, artifactText, context, stdNames) {
  //check if its a stdLib include
  if (stdNames[artifactText] !== undefined) {
    return stdNames[artifactText];
  }

  //if its not a stdLib include, its one of:
    // relative URL
    // relative File
    // absolute Url

  //this is a hack and is ugly but its a failing in the grammar
  //you can't have "./foo" be text; you have to put it in a file

  //absolute URL
  if ((artifactText || '').indexOf('http') === 0) {
    return artifactText;
  }

  //relative URL/File
  if ((artifactText || '').indexOf('.') !== 0) {
    //return false to signal that the artifact text is NOT a path
    return false;
  }

  return context.path.resolve(context.path.dirname(declaredFile), artifactText);
}

async function getStdNames(fs) {
  const stdDirectory = fs.path.resolve(__dirname, relativePathToStd);
  const stdNames = await fs.ls(stdDirectory);

  return stdNames
    .toMap(name => fs.path.resolve(stdDirectory, name, `${name}.st`));
}
