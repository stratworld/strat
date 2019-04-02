# The Strat Cloud Language

Strat is a language to represent and deploy portable cloud systems.  Strat is the first "infrastructure as high level code" language, and it represents an evolutionary leap over tools like Terraform, CloudFormation, and Serverless Framework.  Here's what the future looks like:

Create HelloWorld.st:
```st
service HelloWorld {
  include "Http"

  Http { method: "get", path: "*" } -> "Hello World!"
}
```
Then in your terminal ([requires npm](https://nodejs.org/en/)):
```sh
npm install -g stratc
stratc ./HelloWorld.st && stratc ./HelloWorld.sa
```
See it at [localhost:3000](http://localhost:3000).

With Strat you don't specify infrastructure details, just how you don't write gotos and register assignments anymore.  The Strat compiler figures out how to host your system for you.  You write your system components as simple functions in languges you already know like Javascript, then you write Strat files that describe how those files form a system.

### Better infrastructure than what you're building by hand

Just how language compilers like gcc and Javac optimize your code, __Strat's compiler optimizes your infrastructure to be:__

  - __more secure__ by building the narrowest access control for every component in your system
  - __faster__ by hosting components on optimal infrastructure, whether that's a container or APIGateway backed by lambda.
  - __cheaper__ by sharing resources like lambda invocations between what would be discrete components in hand-rolled architectures.
  - __free from human error__ by performing static analysis and compiling your infrastructure code.

### Portabilty is back

Lets run that hello world system on AWS.

If you don't have a burner AWS account already, make one and set up your [credentials file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

Run in your terminal
```
stratc --aws ./HelloWorld.sa
```
See it at the APIGateway URL logged in the console.

Strat's portability focus is on getting predictable system behavior between development and production hardware.  The days of testing Lambdas in production are over.  If cloud providers are the new hardware vendors Strat is the new Java.

### Quit writing surface area code

You know all that innane connection logic you have to write to get service A to talk to service B?  What about service authentication stuff?  Struggling with 3rd party APIs, or even the api to the service you wrote a year ago?  This is all surface area code--the stuff that connects software components together.  As our software components get smaller and more numerous, the amount of surface area code we write grows exponentially.  Strat fights back by abstracting over connection logic by using smart defaults and conventions.  It can also hook into best practice solutions like the [OpenAPI initiative](https://www.openapis.org/).  Here's how a service connects to another in Strat:

Books.st:
```st
service Books {
  include "https://s0tjdzrsha.execute-api.us-west-2.amazonaws.com/Sales/strat/Sales/Sales.st"
  getBooks ():any -> "./getBooks.js"
}
```

getBooks.js:
```javascript
const Strat = require('strat');
const getSales = Strat('Sales.getSales');
const sales = await getSales();
```

# "Just"ice

We say "just" a lot: "just do this" or "it just works!" or "I just want a server!".  The modern DevOps landscape overindexes on power and configurability over simplicity and "just-works-iness".  What's the customer value of setting up and operating [Consul](https://www.hashicorp.com/products/consul) for your CRUD application?  Don't get us wrong, the modern cloud is an engineering marvel and you'd be crazy not to run your systems on it, but now that its been around for a while its not unreasonable to demand higher user experience standards--yaml config files don't cut it anymore.

Ruby on Rails showed the world most people can get by fine with "just" the basics and convention.  Strat has traditional language influences (ML, Javascript, Java, etc.), but perhaps its most important influence is the philosophical legacy left by Rails.



#### Like what you see?  Continue to the [Hello World deep dive](https://strat.world/Guides/Hello%20World) or build an [N-tier bookstore](https://strat.world/Guides/Bookstore).

### Contributing

Strat is an ambitious project--if you're interested in working on Strat or its ecosystem, send an email to [interest@strat.world](mailto:interest@strat.world);
