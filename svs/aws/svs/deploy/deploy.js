module.exports = function (resources) {
  return preDeploy(resources)
    .then(() => Promise.all(resources.map(resource => {
      return deploy(resource)
        .then(implementation => {
          resource.implementation = implementation;
          return R(resource);
        });
    })));
}

function preDeploy (resources) {
  const preCreateResources = resources
    .filter(resource => resource.compute.preCreate !== undefined)
    .reduce((lookup, resource) => {
      lookup[resource.compute.service] = resource.compute.preCreate;
      return lookup;
    }, {});

  return Promise.all(preCreateResources
    .keys()
    .map(resourceService => 
      require(preCreateResources[resourceService])
        (resources
          .filter(resource => resource.compute.service === resourceService))))
    .catch(e => {
      if (e.code === 'BucketAlreadyOwnedByYou') {
        throw `This system artifact file is already deployed to AWS and cannot be deployed again.`;
      }
    })
}

function deploy (resource) {
  return require(resource.compute.create)(resource);
}
