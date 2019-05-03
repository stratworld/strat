# The Strat Cloud Language

Strat is a language to represent and deploy portable cloud systems.  Strat takes simple functions written in languages you know like Javascript and Go and compiles them into event-driven and service-oriented systems running on the serverless cloud.  Strat is the first "infrastructure as high-level code" language, and it represents an evolutionary leap over tools like Terraform, CloudFormation, and Serverless Framework.  Here's hello world:

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

In existing configuration management tools, you specify infrastructure details directly--"this is a Lambda", "deploy this in a container", "this talks to SQS", etc.  Strat exposes a standard library that abstracts over these proprietary services just how [NodeJS's fs](https://nodejs.org/api/fs.html) abstracts over each operating system's file API.

### Services as Libraries

Write, extend, and include entire services in your system.  Here's how you'd incorporate a GitHub commit webhook inside your system:

```st
service ContinuousIntegration {
  include "./GitHubCommit"

  GitHubCommit { repository: "Stratosphere" } -> "./beginCIBuild.js"
}
```

And the GitHubCommit library only uses the Strat standard library, so its 100% portable:

```st
source GitHubCommit {
  //Strat handles setting up ApiGateway, local with ngrok, etc.
  include "Http"
  include "Birth"

  Http { method: "post", path: "Strat/GitHubCommit" } ->
    "./gitHubWebhookReception.js"

  Birth -> "./registerGitHubWebhook.js"
}
```

While the current generation of configuration management extends itself with "plugins", yaml files, and closed source features, Strat places all the power in the community's hands with a robust foreign function interface, a standard library, and powerful inclusion semantics.  Authoring a service or source in Strat others can use is as easy as creating a module or library for computation languages.

### Better infrastructure than what you're building by hand

Just how language compilers like gcc optimize your code, __Strat's compiler optimizes your infrastructure to be:__

  - __more secure__ by building the narrowest access control for every component in your system
  - __faster and cheaper__ by sharing resources like lambda invocations between what would be discrete components in hand-rolled architectures.
  - __free from configuration errors__ by generating static files, compute resources, and roles with a compiler, Strat produces correct, best-in-class infrastructure every time.

### Portabilty is back

Strat creates a bytecode-esque system artifact (.sa) file that represents your system and its dependencies, then a Strat substrate executes that .sa file to produce running infrastructure.  The .sa file format is simple and can be implemented by many different clouds, single machines, and even on-premise datacenters.  Today you can run your .sa files locally, on AWS, and on Linux servers.

With Strat, you can write complex, fully featured systems using cutting edge technologies like Lambda without ever having to use a single proprietary API, and without sacrificing local execution and reproducibility.

#### Like what you see?  Continue to the [Hello World deep dive](./Guides/Hello%20World) or build an [N-tier bookstore](./Guides/Bookstore).
