# Role Extensions (AWS)

Strat builds roles for every resource it deploys.  This can pose problems if users want to access other resources within their AWS account.  The AWS SVS provides users a way to specify additional roles they wish to inject into the roles created for individual services.

Given the following Strat code which calls an artifact that wishes to scan a DynamoDB table named "Thing":

```st
service ThingService {
  getThings ():any -> "./getThings.js"
}
```

To add the permission to scan a DynamoDB table the user would create an svs.json with the following roles property:

```json
{
  "aws": {
    "roles": {
      "ThingService": [
        {
          "action": [ "dynamodb:Scan" ],
          "arn": "arn:aws:dynamodb:*:*:table/Thing"
        }
      ]
    }
  }
}
```

The roles property must be a map with the keys bieng the service name, and the value bieng an array of additional permissions, which are maps with two keys action and arn.  Action must be an array of strings, each of which must be [AWS Actions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/api-permissions-reference.html), and the arn must be the resource ThingService wants to access.  Additional permissions objects are passed directly to the IAM AWS SDK without mutation.
