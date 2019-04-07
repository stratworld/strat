# AWS SVS Guide

The AWS SVS uses Lambda, APIGateway, S3, and IAM to fulfill users' infrastructure requirements.

## Credentials

Stratc needs credentials to create the resources above on your AWS account.  The easiest way to supply these is by letting stratc use your shared [credentials file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).  If you wish to create a custom user to have stratc run under, you can do so by supplying an access key directly inside the config block of your svs.json:

```json
{
  "substrate": "aws",
  "aws": {
    "config": {
      "region": "us-west-2",
      "accessKeyId": "<access key>",
      "secretAccessKey": "<secret>"
    }
  }
}
```

Keys provided this way override keys from your shared credentials file.  A minimum IAM policy configuration for stratc to run is:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "s3:PutObject",
                "apigateway:DELETE",
                "apigateway:UpdateRestApiPolicy",
                "apigateway:PUT",
                "apigateway:PATCH",
                "iam:CreateRole",
                "s3:CreateBucket",
                "iam:UpdateRole",
                "apigateway:POST"
            ],
            "Resource": "*"
        }
    ]
}
```