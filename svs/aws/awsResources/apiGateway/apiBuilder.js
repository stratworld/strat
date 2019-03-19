const p = require('util').promisify;
function buildSDK (AWS) {
  const apiGateway = new AWS.APIGateway();
  const sdk = {};
  function promisify (methodName) {
    return p(apiGateway[methodName].bind(apiGateway));
  }
  sdk.getResources = promisify('getResources');
  sdk.create = promisify('createRestApi');
  sdk.addMethod = promisify('putMethod');
  sdk.getMethod = promisify('getMethod');
  sdk.addIntegration = promisify('putIntegration');
  sdk.getIntegration = promisify('getIntegration');
  sdk.getApis = promisify('getRestApis');
  sdk.createResource = promisify('createResource');
  sdk.createDeployment = promisify('createDeployment');
  sdk.createStage = promisify('createStage');
  sdk.getStages = promisify('getStages');
  sdk.updateStage = promisify('updateStage');

  return sdk;
}


module.exports = function (region, AWS, eventInfo, implementation) {
  const sdk = buildSDK(AWS);
  const name = eventInfo.service;
  const role = eventInfo.role;
  const targetLambda = implementation.functionArn;
  //stupid stage name
  const stageName = name;

  console.log(`Deploying APIGateway for ${name}`);
  return createApiIdempotent(name)
    .then(api => {
      const apiId = api.id;
      return getRootResourceId(apiId)
        .then(rootId => {
          return createAnyMethodIdempotent(apiId, rootId)
            .then(() => addIntegrationIdempotent(apiId, rootId, role, targetLambda))
            .then(() => addResourceIdempotent(apiId, rootId, '{proxy+}'))
            .then(proxyResourceId => createAnyMethodIdempotent(apiId, proxyResourceId)
              .then(() => addIntegrationIdempotent(apiId, proxyResourceId, role, targetLambda)))
        })
        .then(() => deploy(apiId))
        .then(() => {
          console.log(`Service ${name} accessible at ${getDeploymentLocation(apiId)}
  Previous deployments to this URL may be cached for up to a minute.`);

          return R();
        });
    });

  function getApiLambdaArn (functionArn) {
    return `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`;
  }

  function getDeploymentLocation (apiId) {
    return `https://${apiId}.execute-api.${region}.amazonaws.com/${stageName}`;
  }

  function createApiIdempotent (name) {
    return sdk.getApis()
      .then(apis => {
        const foundApi = apis.items
          .filter(api => api.name === name)[0];

        if (foundApi !== undefined) {
          return Promise.resolve(foundApi);
        }
        return sdk.create({
          name: name
        });
      });
  }

  function getRootResourceId (apiId) {
    return sdk.getResources({
      restApiId: apiId
    })
    .then(response => {
      const resources = response.items;
      return Promise.resolve(resources
        .filter(resource => resource.path === '/')
        .map(root => root.id)
        [0]);
    })
  }

  function createAnyMethodIdempotent (apiId, resourceId) {
    return sdk.getMethod({
      httpMethod: 'ANY',
      resourceId: resourceId,
      restApiId: apiId
    })
    .catch(e => sdk.addMethod({
        restApiId: apiId,
        resourceId: resourceId,
        httpMethod: "ANY",
        authorizationType: 'NONE'
    }));
  }

  // This seems to do a totally different thing than all the other APIs
  // and actually overwrites whatever is already there so its idempotent
  // out of the box!  Wow!  They lucked into good API design for once...
  function addIntegrationIdempotent (apiId, resourceId, role, targetLambda) {
    return sdk.addIntegration({
      restApiId: apiId,
      resourceId: resourceId,
      httpMethod: "ANY",
      integrationHttpMethod: 'POST',
      credentials: role,
      type: 'AWS_PROXY',
      uri: getApiLambdaArn(targetLambda)
    });
  }

  function addResourceIdempotent (apiId, parentId, path) {
    return sdk.getResources({
      restApiId: apiId
    })
    .then(response => {
      const resources = response.items;
      const existing = resources
        .filter(resource => resource.parentId === parentId
          && resource.pathPart === path)
        [0];

      if (existing !== undefined) {
        return Promise.resolve(existing.id);
      }
      return sdk.createResource({
          parentId: parentId,
          pathPart: path,
          restApiId: apiId
        })
        .then(resource => Promise.resolve(resource.id));
    });
  }

  function deploy (apiId) {
    return sdk.createDeployment({
      restApiId: apiId
    })
    .then(deployment => {
      const deploymentId = deployment.id;
      return sdk.getStages({
        restApiId: apiId
      }).then(stages => {
                  //yes, its actually "item", even if its an array
        const existingStage = stages.item
          .filter(stage => stage.stageName === stageName)
          [0];
        return existingStage !== undefined
          ? sdk.updateStage({
              restApiId: apiId,
              stageName: stageName,
              //what the fuck
              patchOperations: [
                {
                  op: 'replace',
                  value: deploymentId,
                  path: '/deploymentId'
                }
              ]
            })
          : sdk.createStage({
              restApiId: apiId,
              deploymentId: deploymentId,
              stageName: stageName
            });
      });
    });
  }
};
