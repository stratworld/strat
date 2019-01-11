# The Lit System Language

Lit is a language to represent and deploy systems.

Write your software in regular programming languages like Javascript then write .lit files that describe how your components fit together to form a system.  No infrastrucutre configuration or setup needed.  Lit compiles your normal code and .lit files into a .sys file, then it can deploy .sys files to any substrate including AWS, Azure, Docker containers, and single machines.

## What's a "system language"?

Normal programming languages encode instructions for single computers.  A system language specifies how many computational components fit together and communicate to form a larger system which may involve many computers.  Lit is a special type of system language that describes stateless, event driven systems.  Common examples of this class of system are RESTful web services or the systems people are building with FAAS serverless technologies.


## So its like CloudFormation, Terraform, Puppet, Chef, Serverless Framework, etc.?

With all of those technologies you write your normal application code then write some supplementary configuration or code that describes infrastructure.  Lit is no exception here--a system built with Lit will have a bunch of .js (or whatever) files and a few .lit files.  The major difference, and it is a massive difference, is all of those technologies force you to specify details about what infrastructure you need to run your system.  Lit is a much higher level language and its compiler determines how to run your system without you specifying details.

**Those technologies like to throw around the term "infrastructure as code".  Really, they're "infrastructure as *assembly*", and Lit is "intrastructure as *high level code*".**

## Is it like Containers?

Its like serverless meets containers--a sys file is like a container that contains your entire system of functions instead of a single service, and instead of running many instances of that container on many nodes, you run one instance of the sys file on AWS.  Your whole system is a single file, and you can "run" that file on any substrate you want--including but not limited to:

  - AWS using Lambda, S3, APIGateway, CloudWatch, and more
  - Azure
  - Your local computer
  - A docker container


## Hello World

This is what it takes to build a system that can serve "Hello World" over http.  This code can be deployed onto AWS or your local machine without modification:

HelloWorld.lit:
```
service HelloWorld {
  include "Http"

  Http { method: "get", path: "*" } ->
  any helloWorld (void) {
    artifact: "helloWorld.js"
  }
}
```

helloWorld.js:
```js
module.exports = () => "Hello World!"
```

## Contributing

This repository contains the source code for:
  1) The language's compiler [language/]
  2) The language's standard library [stdSources/]
  3) The "runtime" on which systems built with Lit run [runtime/]
