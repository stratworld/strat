# Hello world

This guide will walk you through your first Lit system.  You'll create a Lit system and deploy it to your local computer then take that system and deploy it to AWS.  There are no mysterious repositories to clone--every line of code you need is here in this guide.  You will need to install [litc]("https://lit.build/Guides/Getting%20Started"), lit's compiler, and if you wish to deploy to AWS you will need an account and a few permissions set up which are outlined in the AWS section.

# Local Hello World

1. 1) Create a file "HelloWorld.lit" and paste the following into it:

```lit
service HelloWorld {
  include "Http"

  Http { method: "get", path: "*" } ->
    helloWorld ():any ->
      "./helloWorld.js"
}
```

2. 2) Create a file "helloWorld.js" in the same directory and paste the following into it:

```javascript
module.exports = () => `Hello World at ${Date.now()}!`
```

3. 3) Build and deploy HelloWorld.lit:

```bash
$ litc build ./HelloWorld.lit && litc deploy ./HelloWorld.sys
```

4. 4) Navigate to [localhost:3000](http://localhost:3000) in your browser


# The Basics

Lit is all about "events", "functions", and "services".  Its sole purpose is to describe what events and functions exist in your system and how those events are handled by those functions.

An "event" is a single piece of serialized data that is passed into your system.  Events come from "sources", and in this example we're including "Http", which is the event source for http requests provided by lit's standard library.  Including Http tells lit that the HelloWorld service accepts http events, or in more familiar terms, that the HelloWorld service is a web server.

A "function" is a single computational unit within your system, and it represents the actual infrastructure that gets deployed.  Functions accept events and execute code, and "services" are groupings of functions that control access to these infrastructure components.

The first step is to run lit build, which creates a .sys file, which is a deployable bundle of the entire system.  Sys files can be moved from computer to computer and contain version and other metadata about your system that make them ideal CI/CD artifacts.  Then, we deploy that .sys file to your local computer.  We could also deploy that same .sys file to the AWS substrate, but we'll keep things simple for now.

## Line by line breakdown
```
service HelloWorld {
```
Here we declare a service HelloWorld.  All functions must reside within a service.  Outside of providing grouping for functions, services also control roles and permissions within your system.  Access control in Lit systems behaves like scope in a language like Java.

### 
```
include "Http"
```
Including Http lets us recieve Http events and tells lit this is a web server.  You may notice that the include is within the service definition while most other languages put includes and exports at the top of a file.  In Lit you place includes within services to show that including Http modifies the HelloWorld service and shows includes play by the same scope and access control rules as functions.  [Http](https://lit.build/Sources/Http) is a standard event source and part of the lit standard library.

### 
```
Http { method: "get", path: "\*" } ->
```
This is an "event description", and its semantics are determined by the Http event source.  The gist here is we're describing what type of Http event should be sent to the following function.  This can be translated as "All Http get requests should be sent to the following function".

### 
```
helloWorld ():any ->
```
This is a function signature, complete with a function name, input type within the parens (in this case, no input type), and output type after the colon.  Types are not implemented yet in lit, so this function returns the any type while in the future it will return "string".

### 
```
"./helloWorld.js"
```
This is the final part of a function definition--the artifact.  This is the code that will be run in response to the http event declared above.  For now, assume that this .js file will be run by NodeJs...somewhere...more on code execution can be found in the [functions section of the specification]("https://lit.build/Specification/Functions").


## What did this do?

You may notice that new build/ directory--feel free to poke around.  You can find our friendly helloWorld.js file copied to build/{build_id}/HelloWorld-helloWorld/helloWorld.js with a bunch of stuff copied around it.  That stuff is the "host", which is a part of the lit "runtime".  The host's job is to interface with whatever infrastructure your code is running on and move events to and from your code.

The Http event source also created a web server using NodeJS's Http library, which is what you're visiting when you navigate to localhost:3000.  The other top level directory (HelloWorld-lit_generated_proxy_Http) was also built by the Http source to work with the web server to determine what code should be executed in response to what requests.

### All together:
  - Http created a web server running on port 3000
  - Http created a proxy function that receives all requests from that web server and routes requests to lit functions within the HelloWorld service
  - The NodeJS host receives all get requests, invokes user code (helloWorld.js), and sends the responses back to the http proxy

# AWS Hello World

Now that you're acquainted with the basics of lit, lets do something more exciting--run this on real, production worthy infrastructure.

1) If you don't already have an AWS account that you can fool around with, create one.  Everything we're about to do falls well within AWS free tier limits.

2) Change litconfig.json to be:

```json
{
  "substrate": "aws",
  "aws": {
    "config": {
      "region": "us-west-2"
    }
  }
}

```
NOTE: everything within the "config" hash is passed into the [AWS.Config](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html) method of the AWS SDK, so you can add and change things as needed (for instance, you can change the region to "us-west-1").

3) Lit will need to create resources on your AWS account and will need credentials to do that.  There are two ways it can access those credentials.  You need to do at least one of the following:

  + A) Supply AWS credentials within the litconfig.json
    - add these two properties to the config hash in litconfig.json:
    - "accessKeyId": "{your access key id}",
    - "secretAccessKey": "{your secret access key}"

  + B) Have lit use your shared ~/.aws/credentials file
    - follow the instructions to create a shared credentials file [here](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).  Note: you may already have one--try
    - ```bash
    $ stat ~/.aws/credentials
    ```

    NOTE: credentials provided through A override B.

4) In the future, lit will create appropriate roles for each resource it creates.  Today, you need to create a role with some basic permissions for lit to use when creating resources.  Create an IAM role with the following policies:

  + AWSLambdaFullAccess
  + AmazonS3FullAccess
  + InvokeAllLambda

And make sure the role is assumable by Lambda and ApiGateway:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "apigateway.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Now, add this role's arn to litconfig.json at the path aws/preCreatedRole.  Your litconfig.json should look like this:

```json
{
  "substrate": "aws",
  "aws": {
    "config": {
      "region": "us-west-2"
    },
    "preCreatedRole": "{arn for the role you just created}"
  }
}
```

5) Run lit deploy (we don't need to build again--we can use the same .sys file!)

```bash
  $ litc deploy ./HelloWorld.sys
```

## Check it out

Inside your AWS console you can see lit created a single lambda function and an APIGateway API called "HelloWorld".  You can invoke the system by navigating to the url APIGateway generates for you.  You can find this under the stages tab on the left of the APIGateway console for HelloWorld.

If you're hungry for a more sophisticated example, you can check out a full n-tier architecture book store written in lit [here](https://github.com/CaptainCharlieGreen/lit_demo).
