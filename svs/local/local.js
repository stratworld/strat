const nodeEval = require('node-eval');
const Archive = require('../../util/archiveBuilder');
const stdPath = require('path');
const config = require("../config")();
const fs = require('../../util/fileSystem');

module.exports = async function (saData) {
  const archive = new Archive(saData);
  const substrateImpls = await getSubstrateImpls();

  const hosts = JSON.parse(archive.read('hosts.json').toString());

  const hijack = require('strat').getHijack();

  const domoLookup = getDomoLookup(hosts, archive, substrateImpls);

  await hijack.setDomos(domoLookup);

  const registry = getRegistry(archive, hosts, substrateImpls);

  hijack.setRegistry(registry);

  try {
    printBirthResults(await birth(hosts, hijack));
    process.exit(0);
  } catch (e) {
    console.log(e.stack);
    process.exit(1);
  }
};

//load in majordomo functions first
function getDomoLookup (hosts, archive, substrateImpls) {
  return hosts
    .pairs()
    .flatmap(kvps => {
      const hostName = kvps[0];
      const domoArtifact = kvps[1].artifacts
        .filter(artifact => artifact.name === 'Strat.majordomo')
        [0];
      return kvps[1].artifacts
        .map(artifact => [artifact.name.split('.')[0], hostName, domoArtifact]);
    })
    .toMap(tuple => {
      return {
        domo: loadFunction(tuple[2],
          archive,
          undefined,
          substrateImpls),
        hostName: tuple[1]
      }
    }, t => t[0]);
}

function getRegistry (archive, hosts, substrateImpls) {
  return hosts
    .pairs()
    .flatmap(kvp => kvp[1].artifacts
      .map(artifact => [kvp[0], artifact]))
    .reduce((lookup, artifactTuple) => {
      const artifact = artifactTuple[1];
      const hostName = artifactTuple[0];
      lookup[artifact.name] = (artifact.isResource
        ? loadResource: loadFunction)(artifact, archive, hostName, substrateImpls);
      return lookup;
    }, {});
}

//todo: error handling in this function
//maybe not; maybe the domo does everything
//maybe the domo turns shit to gold
function loadFunction (artifact, archive, hostName, substrateImpls) {
  var filePath = artifact.saPath;

  const substrateImpl = substrateImpls.get(artifact.name);
  var data;
  if (substrateImpl !== undefined) {
    data = substrateImpl.data;
    filePath = substrateImpl.path;
  } else {
    data = archive.read(filePath).toString();
  }

  const invokableFunction = nodeEval(data, `./${filePath}`);

  if (typeof invokableFunction !== 'function') {
    throw new Error(`Module exported by ${artifact.name} is not a function.`);
  }

  return async function invoke (a, b) {
    return invokableFunction(a, b);
  };
}

function loadResource (artifact, archive) {
  return async function () {
    return archive.read(artifact.saPath).toString();
  }
}

async function birth (hosts, hijack) {
  return Promise.all(hosts.keys().map(async hostName => {
    return await hijack.dispatch(hostName, 'Birth');
  }));
}

function printBirthResults (birthResultsArray) {
  (birthResultsArray || [])
    .forEach(birthResultObj => {
      birthResultObj.pairs().forEach(kvp => {
        console.log(`Birth response from ${kvp[0]}:`);
        console.log(`  ${JSON.stringify(kvp[1], null, 2)}`);
      });
    });
}

async function getSubstrateImpls () {
  const implDir = fs.path.resolve(__dirname, './SubstrateImpl')
  const implFileNames = await fs.ls(implDir);

  const implFileData = (await Promise.all(implFileNames
    .map(name => fs.path.resolve(implDir, name))
    .map(async absolutePath => [
      absolutePath,
      (await fs.cat(absolutePath)).toString()
    ])))
    .map(pathTuple => {
      return {
        path: pathTuple[0],
        data: pathTuple[1]
      }
    });

  const implFileMap = implFileNames
    .map((name, i) => [`.$SUBSTRATE-${fs.path.basename(name, '.js')}`, implFileData[i]])
    .toMap(t => t[1], t => t[0]);

  return {
    get: artifactName => implFileMap.keys()
      .filter(key => artifactName.indexOf(key) > -1)
      .map(key => implFileMap[key])
      .map(ret => {
        return {
          ...ret,
          path: `${artifactName}/${fs.path.basename(ret.path)}`,
        };
      })
      [0]
  };
}
