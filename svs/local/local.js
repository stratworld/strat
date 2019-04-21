const nodeEval = require('node-eval');
const Archive = require('../../util/archiveBuilder');
const stdPath = require('path');
const Http = require('./Http');
const config = require("../config")();

//todo: error handling
module.exports = async function (saData) {
  const archive = new Archive(saData);

  const hosts = JSON.parse(archive.read('hosts.json').toString());

  const hijack = require('strat');
  
  const domoLookup = getDomoLookup(hosts, archive);

  await hijack.setDomos(domoLookup);

  const registry = getRegistry(archive, hosts);

  hijack.setRegistry(registry);

  await birth(hosts, hijack);
};

//load in majordomo functions first
function getDomoLookup (hosts, archive) {
  return hosts
    .pairs()
    .map(kvps => {
      const hostName = kvps[0];
      const domoArtifact = kvps[1].artifacts
        .filter(artifact => artifact.name === 'Strat.majordomo')
        [0];
      return [hostName, domoArtifact]
    })
    .toMap(tuple => loadFunction(tuple[1], archive), t => t[0]);
}

function getRegistry (archive, hosts) {
  return hosts
    .pairs()
    .flatmap(kvp => kvp[1].artifacts
      .map(artifact => [kvp[0], artifact]))
    .reduce((lookup, artifactTuple) => {
      const artifact = artifactTuple[1];
      const hostName = artifactTuple[0];
      lookup[artifact.name] = (artifact.media === '.txt'
        ? loadResource: loadFunction)(artifact, archive, hostName);
      return lookup;
    }, {});
}

//todo: error handling in this function
//maybe not; maybe the domo does everything
//maybe the domo turns shit to gold
function loadFunction (artifact, archive, hostName) {
  const fileName = artifact.absolutePath === false
    ? `data${artifact.media}`
    : stdPath.basename(artifact.absolutePath);
  const filePath = stdPath.join(artifact.name, fileName);

  const artifactData = archive.read(filePath).toString();

  //we need to pass the filepath to the strat dep because strat has to
  //change its behavior based on the script that calls it (to handle scope)
  const modifiedScript = artifactData.replace(
    /require\('strat'\)/g,
    `require('strat')('${hostName}')`);
  const invokableFunction = nodeEval(modifiedScript, `./${filePath}`);

  if (typeof invokableFunction !== 'function') {
    throw new Error(`Module exported by ${artifact.name} is not a function.`);
  }

  return async (a, b) => {
    return invokableFunction(a, b);
  };
}

function loadResource (artifact, archive) {
  const filePath = stdPath.join(
    artifact.name,
    "data.txt");

  return async function () {
    return archive.read(filePath).toString();
  }
}

async function birth (hosts, hijack) {
  return Promise.all(hosts.keys().map(async hostName => {
    return hijack.dispatch(hostName, 'Birth');
  }));
}
