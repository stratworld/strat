# AWS SVS (staws) Guide

Staws uses Lambda, API Gateway, and IAM to fulfill users' infrastructure requirements.  It maps each host within a .sa file to a single lambda and implements Http with API Gateway.  It creates new IAM roles for each deploy based on the ID of the .sa file, and it creates a new role for each lambda and API Gateway.  To do so, it needs access to a user with the following minimum IAM policy configuration:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "apigateway:DELETE",
        "apigateway:UpdateRestApiPolicy",
        "apigateway:PUT",
        "apigateway:PATCH",
        "apigateway:GET",
        "apigateway:POST",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:UpdateRole",
        "iam:PutRolePolicy",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

# staws command reference

```
  -v or --version   prints the version of staws
  -h or --help      prints this documentation
  .sa file          deploys the contents of the .sa file
                      EX: staws HelloWorld.sa
```

# staws.json

Users can supply a staws.json in the same directory they're executing staws from to provide additional AWS specific behavior.  If no staws.json is found, staws provides a default:

```json
"config": {
  "region": "us-west-2"
}
```

## Credentials

The easiest way to supply credentials while running staws is by letting stratc use your shared [credentials file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).  If you wish to create a custom user to have staws run under, you can do so by supplying an access key directly inside the config block of your staws.json:

```json
{
  "config": {
    "region": "us-west-2",
    "accessKeyId": "<access key>",
    "secretAccessKey": "<secret>"
  }
}
```

## region

A region must be supplied in your staws.json, and that region must have Lambda and API gateway.

## Additional Lambda Permissions

If your component code needs to access addtional resources outside those created by Strat like a DynamoDb table you can supply them in the staws.json config file in a roles property:

```json
{
  "config": {
    "region": "us-west-2"
  },
  "roles": {
    "<SERVICE NAME>": [
      {
        "action": [ "dynamodb:Scan" ],
        "arn": "arn:aws:dynamodb:*:*:table/<YourTable>"
      }
    ]
  }
}
```

The roles property is a map where keys are service or source names that should get extra permissions, and the values are lists of IAM-policy-document-like (the capitalization is different) objects.

Action must be an array of strings, each of which must be an [AWS Action](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/api-permissions-reference.html).  Unfortuately, these are pretty hard to look up.  You can run your code and see what errors occur--AWS is good about letting you know what action you need.
