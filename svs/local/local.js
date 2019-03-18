const nodeEval = require('node-eval');
const Archive = require('../../util/archiveBuilder');
const stdPath = require('path');
const Http = require('./Http');

//todo: error handling
module.exports = async function (saData) {
  const archive = new Archive(saData);

  const ir = JSON.parse(archive.read('ir.json').toString());


  const registry = getRegistry(archive, ir);

  require('strat')(ir, registry);

  await connect(ir, registry);
};

function getRegistry (archive, ir) {
  return ir.hosts
    .flatmap(host => host.artifacts
      .map(artifact => [host.runtime, artifact]))
    .reduce((lookup, artifactTuple) => {
      const artifact = artifactTuple[1];
      const runtime = artifactTuple[0];
      lookup[artifact.name] = (runtime === undefined
        ? loadResource: loadFunction)(artifact, archive);
      return lookup;
    }, {});
}

//todo: error handling in this function
function loadFunction (artifactConfig, archive) {
  const filePath = stdPath.join(
    artifactConfig.name,
    stdPath.basename(artifactConfig.path));

  const artifactData = archive.read(filePath).toString();

  //we need to pass the filepath to the strat dep because strat has to
  //change its behavior based on the script that calls it (to handle scope)
  const modifiedScript = artifactData.replace(
    /require\('strat'\)/g,
    `require('strat')('${artifactConfig.name}')`);
  const invokableFunction = nodeEval(modifiedScript, `./${filePath}`);

  return event => {
    const result = invokableFunction(event, artifactConfig.declaration);
    return typeof result === 'object'
      && typeof result.then === 'function'
      ? result
      : Promise.resolve(result);
  };
}

function loadResource (artifactConfig, archive) {
  const filePath = stdPath.join(
    artifactConfig.name,
    stdPath.basename(artifactConfig.path));

  return async function () {
    //should we tosring?
    return archive.read(filePath).toString();
  }
}

async function connect (ir, registry) {
  const hostsWithEvents = ir.hosts
    .filter(host => host.events.length >0);

  //todo: since the http server blocks, we'll want to do this
  // in parallel
  // right now this will just start an http server for the first host
  await Promise.all(hostsWithEvents.map(host => {
    const type = host.events[0].type;
    if (type !== 'Http') {
      throw `Event type ${type} not supported`;
    }

    //assumption: the proxy will be first in the artifacts list
    // this is safe because of midend.scopecollapse
    const proxy = registry[host.artifacts[0].name];

    return Http(proxy);
  }));
}
