const {
  traverse, val, line, build
} = require('../../ast');
const compilerConstructor = require('../../compiler');
const stdPath = require('path');

var compile;
var deps;
module.exports = dependencies => async function (ast) {
  const publicFunctions = [
    traverse(ast, ['file', 'service', 'dispatch', 'function', 'functionName']),
    traverse(ast, ['file', 'service', 'function', 'functionName'])
  ].flat()
  .filter(functionIsPublic);

  if (publicFunctions.length === 0) return ast;

  compile = compilerConstructor(dependencies).runCommand;
  deps = dependencies;

  await Promise.all(traverse(ast, ['file', 'service'])
    .map(addProxyResources));

  //Make sure we've fetched Http
  //This is a little strange but we've already run includes
  const httpInclude = traverse(ast, ['file', 'source'])
    .filter(source => val(source, 'name') === "Http")
    [0];

  if (httpInclude === undefined) {
    const parsed = await compile(
        'frontend',
        'service stub { include "Http" }',
        'stub.st');
    
    const astWithHttp = await compile(
        'includes',
        parsed,
        'stub.st');

    ast.file = ast.file.concat(astWithHttp.file
      .filter(file => val(file, 'path') !== 'stub.st'));
  }

  return ast;
}

function functionIsPublic (fn) {
  return val(fn, 'public') !== undefined;
}

async function addProxyResources (service) {
  const publicFunctions = [
    traverse(service, ['function', 'functionName']),
    traverse(service, ['dispatch', 'function', 'functionName'])
  ].flat()
  .filter(functionIsPublic);

  if (publicFunctions.length === 0) return;

  const httpInclude = traverse(service, ['include'])
    .filter(include => val(include, 'path') === 'Http')
    [0];

  if (httpInclude === undefined) {
    service.include = (service.include || [])
      .concat(httpIncludeAST);
  }

  const serviceName = val(service, 'name');

  //create the st file we serve to clients
  const publicService = createPublicService(serviceName, publicFunctions);

  //create a dispatch for this public service we created
  const publicServiceDispatch
    = await createResourceDispatch(serviceName, `${serviceName}.st`);

  //change its artifact to the buffer we created above
  setDispatchArtifact(publicServiceDispatch, publicService);

  //create a dispatch for the client artifact from ./client.js
  const clientDispatch = await createResourceDispatch(serviceName, 'client.js');
  const clientJs = await deps.fs.cat(
    stdPath.resolve(__dirname, './prefabClient.js'));
  setDispatchArtifact(clientDispatch, clientJs);

  //create http resources for each public function
  const newFunctionDispatches = await Promise.all(
    publicFunctions.flatmap(fn => createFunctionDispatch(serviceName, fn))
    );
  //change their artifacts to be the binary data from ./proxy.js
  const proxyJs = await deps.fs.cat(stdPath.resolve(__dirname, './prefabProxy.js'));
  newFunctionDispatches.map(
    dispatch => setDispatchArtifact(dispatch, proxyJs));

  //add all the new dispatches to the original serivice
  service.dispatch = (service.dispatch || [])
    .concat(newFunctionDispatches)
    .concat(publicServiceDispatch)
    .concat(clientDispatch);
}

const httpIncludeAST = build('include', {
  path: {
    value: 'Http',
    line: 0
  }
});

function createPublicService (serviceName, publicFunctionNameAsts) {
  const text = `service ${serviceName} {
  ${publicFunctionNameAsts
    .map(fnAst => createFunctionString(fnAst, './client.js'))
    .join('\n  ')}
}`;
  return Buffer.from(text);
}

function createFunctionString (functionNameAst, artifact) {
  const signature = traverse(functionNameAst, ['signature'])[0];
  if (signature === undefined) {
    return `${val(functionNameAst, 'name')} -> "./client.js"`;
  }

  const shapes = traverse(signature, ['shape']);
  const output = shapes[0];
  const input = shapes[1];
  const inputName = input === undefined
    ? ''
    : val(input, 'name');
  const outputName = val(output, 'name');

  return `${val(functionNameAst, 'name')} (${inputName}):${outputName} -> "${artifact}"`;
}

async function createFunctionDispatch (serviceName, functionNameAst) {
  const functionName = val(functionNameAst, 'name');
  const input = traverse(functionNameAst, ['signature', 'shape'])[1];
  const method = input === undefined
    ? 'get'
    : 'post';
  const text = `service stub {
  Http { method: "${method}", path: "/strat/${serviceName}/${functionName}" } ->
    public${createFunctionString(functionNameAst, 'stub')}
}`;
  return compileDispatch(text);
}

async function createResourceDispatch (serviceName, resourceName) {
  const text = `service stub {
    Http { method: "get", path: "/strat/${serviceName}/${resourceName}"} -> "stub"
}`;
  return compileDispatch(text);
}

async function compileDispatch (text) {
  const newAst = await compile('frontend', text, 'stub.st');
  return traverse(newAst, ['service', 'dispatch'])[0];
}

function setDispatchArtifact (dispatchAst, artifactBuffer) {
  dispatchAst.artifact = artifactBuffer;
}
