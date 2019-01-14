# The Lit System Language

Lit is a language to represent and deploy systems.

Write your software in regular programming languages like Javascript then write .lit files that describe how your components fit together to form a system.  No infrastrucutre configuration or setup needed.  Lit compiles your normal code and .lit files into a .sys file, then it can deploy .sys files to any substrate including AWS, Azure, Docker containers, and single machines.

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

## What's a "system language"?

Normal programming languages encode instructions for single computers.  A system language specifies how many computational components fit together and communicate to form a larger system which may involve many computers.  Lit is a special type of system language that describes stateless, event driven systems.  Common examples of this class of system are RESTful web services or the systems people are building with FAAS serverless technologies.


## So its like CloudFormation, Terraform, Puppet, Chef, Serverless Framework, etc.?

The major difference, and it is a massive difference, is all of those technologies force you to specify details about what infrastructure you need to run your system.  Lit is a much higher level language and its compiler determines how to run your system without you specifying details.

**Those technologies like to throw around the term "infrastructure as code".  Really, they're "infrastructure as *assembly*", and Lit is "intrastructure as *high level code*".**

## Is it like Containers?

Its like serverless meets containers--a .sys file is like a container that contains your entire system of functions instead of a single service, and instead of running many instances of that container on many nodes, you run one instance of the .sys file on AWS.  Your whole system is a single file, and you can "run" that file on any substrate you want--including but not limited to:

  - AWS using Lambda, S3, APIGateway, CloudWatch, and more
  - Azure
  - Your local computer
  - A docker container

## What else does it do?

Because your .lit files don't specify infrastructure directly, the Lit compiler can do what compilers have done for normal languages for decades--**the Lit compiler can optimize your infrastrucutre**:

  - Write your code as many functions, then run those functions all on a single Lambda to reduce costs, improve end user latency, and reduce cold starts.  Early test show this can reduce Lambda hosting costs from 60% to 90%\*.  Code deployed with Lit is both cheaper to operate and produces a better end user experience.
  - Lit creates the perfect permission roles for your components based on their dependencies at compile time.
  - Lit hosts your code inside a thin networking layer configured at compile time.  This layer exposes a "composition API" which can be used to change the runtime behavior of your system.  Practical examples include:
    - Component stack traces.  Track services invoked by request.
    - System debugging.  Step through events as they pass through your system.

And a reminder--the same .sys file you run in production can be deployed without change to your local system to reproduce bugs and get your hands on system behavior.

\* AWS rounds up to the nearest 100ms when billing Lambda functions, and most functions execute much faster than 100ms.  By running serial Lambda functions on the same invocation Lit prevents your company from wasting Lambda execution time.

## How is this all possible?  Sounds too good to be true.

Just as high level languages require the programmer to give up the fine grained control assembly affords, Lit forces the system designer to build in a certian way.  Thankfully, that way happens to be the same way people recognize as "best practice" today--stateless event based systems.  There is no way for a Lit function to save something to a file system--there is no concept of a file system in Lit.  But who today writes stuff to files on their servers?  And even if one component is stateful, all the other components can be built as a Lit system that sits alongside the stateful component running on traditional servers.

Lit would not have been possible 10 years ago before the creation of functions as a service infrastructure.  Services like AWS Lambda provide the crucial bedrock abstraction over servers that Lit is built on top of.  These FAAS services remove two key problems of infrastructure: service discovery and scaling.  Lit can do so much because its only concerned with the infrastructure problems that remain, which boil down to "what goes where", static configuration, and lifecycle management.  You can think of Lit as the realization and application of the potential of FAAS technology.


## Contributing

This repository contains the source code for:
  1) The language's compiler [language/]
  2) The language's standard library [stdSources/]
  3) The "runtime" on which systems built with Lit run [runtime/]
