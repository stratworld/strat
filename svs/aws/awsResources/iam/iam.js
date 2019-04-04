const config = require('../../../config')();
const AWS = require('aws-sdk');
const IAM = new AWS.IAM();

module.exports = async function (ir) {
  const account = await getAccountId();
  const fnArn = getFunctionArner(account, ir.id);
  const s3Object = getS3ObjectArner(account, ir.id);

  const additionalPerms = getAdditionalPerms(ir);

  function getS3Info (host) {
    const name = `${host.compute.config.Bucket}-${host.compute.config.Key}`;
    return {
      name: name,
      arn: s3Object(host.name),
      service: "s3.amazonaws.com",
      serviceInvoke: 's3:GetObject'
    };
  }

  function getLambdaInfo (host) {
    return {
      name: host.compute.config.FunctionName,
      arn: fnArn(host.compute.config.FunctionName),
      service: "lambda.amazonaws.com",
      serviceInvoke: 'lambda:InvokeFunction'
    };
  }

  const roleTuples = await Promise.all(ir.hosts
    .filter(host => host.runtime !== undefined)
    .map(async host => {
      const hostRoleInfo = getLambdaInfo(host);
      const myScopeName = host.artifacts[0].scope;
      const myScope = ir.scopes[myScopeName];
      const targetHosts = myScope
        .keys()
        .map(scopeName => ir.hosts.filter(targetHost => targetHost.name === scopeName)[0])
        .purge()
        .filter(targetHost => targetHost.name !== host.name)
        .map(targetHost => {
          return targetHost.runtime === undefined
            ? getS3Info(targetHost)
            : getLambdaInfo(targetHost)
        });

      const roles = await Promise.all([
        createRuntimeRole(hostRoleInfo, targetHosts, additionalPerms[myScopeName]),
        createConnectRole(
          hostRoleInfo, host.events)
      ]);
      host.connectRole = roles[1];
      return [host.artifacts[0].scope, roles[0]];
    }));

  return roleTuples
    .reduce((roles, nextTuple) => {
      roles[nextTuple[0]] = nextTuple[1];
      return roles;
    }, {});
}

async function createConnectRole (host, events) {
  if (events.length === 0) {
    return undefined;
  }
  const eventType = events[0].type;
  const roleName = `${host.name}${eventType}`;
  const assumeService = eventType === 'Http'
    ? 'apigateway.amazonaws.com'
    : undefined;

  return createRole(assumeService, roleName, [{
    arn: host.arn,
    action: host.serviceInvoke
  }]);
}

async function createRuntimeRole (host, targetHosts, additionalPerms) {
  return createRole(host.service, host.name, targetHosts
    .map(target => {
      return {
        action: target.serviceInvoke,
        arn: target.arn
      };
    })
    .concat((additionalPerms || [])))
}

async function createRole (assumeService, roleName, targets) {
  console.log(`Creating role ${roleName}`);
  var createRoleParams = {
    AssumeRolePolicyDocument: JSON.stringify({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": [ assumeService ]
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }), 
    Path: "/", 
    RoleName: roleName
  };

  const role = await new Promise(function (resolve, reject) {
    IAM.createRole(createRoleParams, (e, r) => {
      if (e) reject(e);
      resolve(r);
    })
  });
  if (targets.length > 0) {
    const policies = {
      Version: "2012-10-17",
      Statement: (targets || [])
        .map(target => {
          return {
            Effect:"Allow",
            Action: Array.isArray(target.action) ? target.action : [ target.action ],
            Resource: target.arn
          }
        })
    };

    const putPolicyParams = {
      PolicyDocument: JSON.stringify(policies),
      PolicyName: `${roleName}invocations`, 
      RoleName: roleName
    };
    
    console.log(`Allowing ${roleName} to invoke:
  ${targets.map(target => target.arn).join('\n  ')}`);

    await new Promise(function (resolve, reject) {
      IAM.putRolePolicy(putPolicyParams, (e, r) => {
        if (e) reject(e);
        resolve(r);
      });
    });
  }

  // console.log('Sleeping for 3 seconds because IAM is terrible');
  //https://stackoverflow.com/questions/36419442/the-role-defined-for-the-function-cannot-be-assumed-by-lambda
  await new Promise(function (resolve, reject) {
    setTimeout(resolve, 3000);
  });

  return role.Role.Arn;
}

function getFunctionArner (account, id) {
  const region = config.aws.config.region;

  return function (functionName) {
    return `arn:aws:lambda:${region}:${account}:function:${functionName}`
  }
}

function getS3ObjectArner (account, buildId) {
  const region = config.aws.config.region;

  return function (resourceName) {
    return `arn:aws:s3:::${buildId}/${resourceName}`;
  }
}

async function getAccountId () {
  var sts = new AWS.STS();
  return await new Promise(function (resolve, reject) {
    sts.getCallerIdentity({}, function(err, data) {
       if (err) {
          reject(err);
       }
       resolve(data.Account);
    });
  });
}

/*

Users may specify perms for scopes that have been collapsed!
They may specify perms for several scopes that get collapsed into a single scope!
*/
function getAdditionalPerms (ir) {
  const collapsedScopes = ir.hosts
    .values()
    .reduce((collapsedScopes, nextHost) => {
      const thisHostsScope = nextHost.artifacts[0].scope;
      nextHost.artifacts
        .forEach(artifact => {
          collapsedScopes[artifact.scope] = artifact.declaration.service;
        });
      return collapsedScopes;
    }, {});

  const additionalPerms = (config.aws.roles || {});

  additionalPerms
    .keys()
    .forEach(key => {
      validateConfigPerm(key, additionalPerms[key]);
    });

  const actualAdditionalPerms = additionalPerms
    .keys()
    .reduce((actualAdditionalPerms, additionalPermName) => {
      actualAdditionalPerms[collapsedScopes[additionalPermName]]
        = (actualAdditionalPerms[collapsedScopes[additionalPermName]] || [])
          .concat(additionalPerms[additionalPermName]);

      return actualAdditionalPerms;
    }, {});

  return actualAdditionalPerms;
}

function validateConfigPerm (scopeName, perms) {
  (perms || [])
    .forEach(perm => {
      const keys = ['action', 'arn']
        .forEach(key => {
          if (perm[key] === undefined) {
            throw `Permission for ${scopeName} incorrectly configured.  Missing key ${key}`;    
          }
        });
    })
}
