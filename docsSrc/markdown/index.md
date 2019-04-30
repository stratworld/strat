# The Strat Cloud Language

Strat is a language to represent and deploy portable cloud systems.  Strat takes simple functions written in languages you know like Javascript and Go and compiles them into event-driven and service-oriented systems running on the cloud.  Strat is the first "infrastructure as high-level code" language, and it represents an evolutionary leap over tools like Terraform, CloudFormation, and Serverless Framework.  Here's hello world:

Create HelloWorld.st:
```st
service HelloWorld {
  include "Birth"

  Birth -> "Hello World!"
}
```
Then in your terminal ([requires npm](https://nodejs.org/en/)):
```sh
npm install -g stratc
stratc ./HelloWorld.st && stratc ./HelloWorld.sa
```

In Strat, you don't specify infrastructure details, just how you don't write gotos and register assignments.  The Strat compiler figures out how to host your system for you.  You write your system components as functions in languages you already know like Javascript, then you write Strat files that describe how those files form a system.

### Better infrastructure than what you're building by hand

Just how language compilers like gcc optimize your code, __Strat's compiler optimizes your infrastructure to be:__

  - __more secure__ by building the narrowest access control for every component in your system
  - __faster__ by hosting components on optimal infrastructure, whether that's a container or APIGateway backed by lambda.
  - __cheaper__ by sharing resources like lambda invocations between what would be discrete components in hand-rolled architectures.
  - __free from human error__ by performing static analysis and compiling your infrastructure code.

### Portabilty is back

Strat creates a bytecode-esque system artifact (.sa) file that represents your system and its dependencies, then a Strat substrate executes that .sa file to produce running infrastructure.  The .sa file format is simple and can be implemented by many different clouds, single machines, and even on-premise datacenters.  Today you can run your .sa files locally, on AWS, and on Linux servers.

With Strat, you can write complex, fully featured systems using cutting edge technologies like Lambda without ever having to use a single proprietary API, and without sacrificing local execution and reproducibility.

### Effortless scaling--never worry about traffic volume or expensive servers

The AWS implementation of Strat places your software on serverless components which scale near infinitely and use a pay-as-you-go model, which means users that build their systems with Strat never have to think about load or the financial implications of beefy scalable infrastructure.

#### Like what you see?  Continue to the [Hello World deep dive](./Guides/Hello%20World) or build an [N-tier bookstore](./Guides/Bookstore).
