/*
"apigateway.amazonaws.com",
"lambda.amazonaws.com"
*/
const config = require('../../../config')();
const AWS = require('aws-sdk');
const IAM = new AWS.IAM();

module.exports = async function (ir) {

  const account = await getAccountId();
  const fnArn = getFunctionArner(account);
  const s3Object = getS3ObjectArner(account, ir.id);

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
      arn: fnArn(host.name),
      service: "lambda.amazonaws.com",
      serviceInvoke: 'lambda:InvokeFunction'
    };
  }

  const roleTuples = await Promise.all(ir.hosts
    .filter(host => host.runtime !== undefined)
    .map(async host => {
      const hostRoleInfo = getLambdaInfo(host);

      const myScope = ir.scopes[host.artifacts[0].scope];
      const targetHosts = myScope
        .keys()
        .map(scopeName => ir.hosts.filter(targetHost => targetHost.name === scopeName)[0])
        .filter(targetHost => targetHost.name !== host.name)
        .map(targetHost => {
          return targetHost.runtime === undefined
            ? getS3Info(targetHost)
            : getLambdaInfo(targetHost)
        });

      const role = await createRole(hostRoleInfo, targetHosts);
      return [host.artifacts[0].scope, role];
    }));

  return roleTuples
    .reduce((roles, nextTuple) => {
      roles[nextTuple[0]] = nextTuple[1];
      return roles;
    }, {});
}

async function createRole (host, targetHosts) {
  console.log(`Creating role ${host.name}`);
  var createRoleParams = {
    AssumeRolePolicyDocument: JSON.stringify({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": [ host.service ]
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }), 
    Path: "/", 
    RoleName: host.name
  };

  const role = await new Promise(function (resolve, reject) {
    IAM.createRole(createRoleParams, (e, r) => {
      if (e) reject(e);
      resolve(r);
    })
  });

  const policies = {
    Version: "2012-10-17",
    Statement: (targetHosts || [])
      .map(host => {
        return {
          Effect:"Allow",
          Action: [ host.serviceInvoke ],
          Resource: host.arn
        }
      })
  };

  const putPolicyParams = {
    PolicyDocument: JSON.stringify(policies),
    PolicyName: `${host.name}invocations`, 
    RoleName: host.name
  };
  
  console.log(`Allowing ${host.name} to invoke:
  ${targetHosts.map(host => host.name).join('\n  ')}`);

  await new Promise(function (resolve, reject) {
    IAM.putRolePolicy(putPolicyParams, (e, r) => {
      if (e) reject(e);
      resolve(r);
    });
  });

  // console.log('Sleeping for 8 seconds because IAM is terrible');
  //https://stackoverflow.com/questions/36419442/the-role-defined-for-the-function-cannot-be-assumed-by-lambda
  await new Promise(function (resolve, reject) {
    setTimeout(resolve, 8000);
  });

  return role.Role.Arn;
}

function getFunctionArner (account) {
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
