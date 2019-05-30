# The Strat Coordination Language

Strat is a language to connect software together.  All that glue code and configuration you write today--that's what Strat is here for.  Strat helps you connect your software to:
  - other software components, like in a service-oriented architecture
  - the infrastructure it runs on
  - the access controls it needs to do its job

You write functions in languages you know like Javascript and Go and Strat compiles them into event-driven and service-oriented systems running on the serverless cloud.

# Hello World

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
curl localhost:3000
```

This creates a hello world system, complete with a web server and "component" that returns "Hello World!".


# Why a new language?  What is a "coordination language"?

Programming languages are about telling __single__ computers what to do.  They assume their job begins and ends with their machine's RAM and CPU, and they let operating systems deal with the outside world.  This worked great in 1970, but as we build smaller and smaller components we have to reach outside the single machine to connect to the outside world constantly, and it hurts every time.

__Software today is as much about gluing components together as it is about writing algorithms, but both industry and academia think this is a "lesser" task.__  A new approach is needed, one that respects and devotes itself to connecting software--a coordination language.  Gluing software together doesn't have to be sludge work, and we don't have to haphazardly stumble through the task.  Here are some of the ways Strat coordinates systems by implementing the same ideas that have enriched programming over the last 50 years.

__Portability-__ In the 1990s programmers were struggling to build compilers and programs for every possible computer architecture.  To cope, Sun made Java and the JVM.  We're in a similar place today with the litany of clouds and cloud services becoming the new hardware vendors, each trying to lock their customers in with slightly different proprietary APIs.  Strat compiles your code into a "system artifact", which can be run on any infrastructure that implements the Strat substrate API.  The result is you can build your system and run it on a massive array of infrastructure from single machines to AWS to on-premise datacenters.  Today, a substrate implementation exists for AWS and local machines, and a GCP implementation is right around the corner. 

__Access-__ Since the 1960s programming languages have had scope and inclusion.  It's such an intuitive concept we don't even think about it-- it's effortless:
```
const x;
function inner () {
  const y;
  console.log(x); // this works!
}
console.log(y); // this doesn't!
```

Imagine having to create a role for every function you make--sounds crazy right?  Some people making advanced serverless systems do just that!  Here's how Strat solves user roles with scope:

```st
service X {
  include "./database.st"

  // works!
  // (Database is a service defined in ./database.st)
  getData ():any -> js `() => Database.get('foo')`
}

service Y {
  // Database is not defined!
  // The infrastructure Y is deployed to won't have
  // access to the Database service.
  getData ():any -> js `() => Database.get('foo')`
}
```

__Error Handling-__ Stack traces are useful tools for debugging large systems, but with highly distributed architectures they turn into noise quickly.  Error information at the lowest levels of your system can tell you exactly what went wrong, but as that exception gets sent over operating systems, networks, and other components it degrades with each step.  Eventually, the end user is met with a 500 internal server error unless the programmer takes immense care.  Strat stops the error-telephone game by preserving stack traces and error information across components.


#### Like what you see?  Continue to the [Hello World deep dive](./Guides/Hello%20World) or build an [N-tier bookstore](./Guides/Bookstore).
