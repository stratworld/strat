# Hello world

This guide will walk you through a simple Strat system.  You'll create a system and deploy it to your local computer then take that system and deploy it to AWS.  You will need to install [stratc](./Getting%20Started), Strat's compiler, and if you wish to deploy to AWS you will need an account that you're comfortable deploying things to.

# Local Hello World

Create a file "HelloWorld.st" and paste the following into it:

```strat
service HelloWorld {
  include "Http"

  Http ->
    helloWorld ():any ->
      "./helloWorld.js"
}
```

Create a file "helloWorld.js" in the same directory and paste the following into it:

```javascript
module.exports = () => `Hello World at ${Date.now()}!`
```

Build and deploy HelloWorld.st:

```bash
$ stratc ./HelloWorld.st && stratc ./HelloWorld.sa
```

Navigate to [localhost:3000](http://localhost:3000) in your browser


# The Basics

Strat is all about events and functions.  Its sole purpose is to describe what events and functions exist in your system and how those events are handled by those functions.

An event is a single piece of serialized data that is passed into your system.  Events come from sources, and in this example we're including Http, which is the event source for http requests provided by Strat's standard library.  Including Http tells Strat that the HelloWorld service accepts http events, or in more familiar terms, that the HelloWorld service is a web server.

A function is a single computational unit within your system, and it represents the actual code that gets run.  Functions accept events and execute code, and services are groupings of functions that control permissions.

The first step is to run stratc on HelloWorld.st, which creates a HelloWorld.sa file, which is a deployable bundle of the entire system.  Sa files can be moved from computer to computer and contain version and other metadata about your system that make them ideal CI/CD artifacts.  Then, we deploy that .sa file to your local computer.  We could also deploy that same .sa file to the AWS substrate, but we'll keep things simple for now.

## Line by line breakdown
```
service HelloWorld {
```
Here we declare a service HelloWorld.  All functions must reside within a service or source.  Outside of providing grouping for functions, services also control roles and permissions within your system.  Access control in Strat systems behaves like scope in a language like Java.

```
include "Http"
```
Including Http let's us receive Http events and tells Strat this is a web server.

```
Http ->
```
This tells strat any Http events should be sent to the following function.

```
helloWorld ():any ->
```
This is a function signature, complete with a function name, input type within the parens (in this case, no input type), and output type after the colon.  Types are not implemented yet in Strat, so this function returns the any type while in the future it will return "text".

```
"./helloWorld.js"
```
This is the final part of a function definition--the [artifact](../User%20Guide/Artifacts).  This is the code that will be run in response to the http event declared above.  For now, assume that this .js file will be run by NodeJs.  The power of Strat lies in users not specifying what type of infrastructure helloWorld.js executes on.  This allows stratc to port systems between wildly different substrates and optimize systems.

# AWS Hello World

Now that you're acquainted with the basics of Strat, lets do something more exciting--run this on real, production worthy infrastructure.  You'll need an AWS account, so if you don't have one go [create one now](https://portal.aws.amazon.com/billing/signup?nc2=h_ct&src=default&redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start)--it's easy, requires no upfront financial commitment, and won't cost you anything to run this system thanks to generous free tiers.

Running .sa files on AWS uses a different piece of software: [staws](https://github.com/stratworld/staws) or the "AWS substrate".  You'll need to install staws:

```bash
npm install -g staws
```

Staws will need to create resources on your AWS account and will need credentials to do that, so go ahead and set up your shared credentials file by following the instructions [here](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).
Note: you may already have one--make sure it's for your test account!  If you're unsure about letting staws take the reins, you can read more about what permissions it requires and how it does its job [here](../User$20Guide/AWS).

Now you're ready to deploy to AWS:

```sh
  $ staws ./HelloWorld.sa
```

You'll see staws create resources in the console.  Look for the APIGateway URL and go there.  The first load takes up to 10 seconds as AWS loads your resources for the first time.


If you're hungry for a more sophisticated example, you can check out a full n-tier architecture bookstore written in Strat [here](./Bookstore).
