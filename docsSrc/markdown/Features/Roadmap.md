# Roadmap

The following features are presented in rough priority order.  The work required varies greatly between epic, with some requiring language development expertise and others DevOps skills and experience with proprietary clouds.

# Shapes (types) & OpenAPI Integration

A core responsibility of Strat is to help users describe and communicate events.  The way programming languages have historically addresed this need is with type systems.  Strat will have a type system for events, but typing events will be very different from typing in memory data structures.

Events

  - (1) Don't exist on a single machine--they are serialized by nature
    - (1.1) and they never contain behavior
  - (2) Are defined and consumed in different software applications
    - (2.1) and by different people (often 3rd parties)
    - (2.2) and are versioned, deployed, and specified in different places
    - (2.3) and change schemas at a different rate than single machine software
  - (3) Are often read and manipulated directly by software engineers

Falling out of these charactaristics, Strat's type system should:

  - A) Have a small delta between program text notation and serialized data representation, which can be assumed is JSON (1, 3)
  - B) Be flexible in response to change (2)
  - C) Be externalizable and have a separate lifespan than component software (2)

Nobody has been particularly successful at addressing all 3 of these concerns--there's plenty of room for invention.  Thankfully, concern C runs in the same grain as the rest of Strat, which is a critical advantage over previous attempts which had types sit in the same ecosystem as component software.

Its worth mentioning that traditional type algebra and much of type systems theory is not applicable to Strat because Strat functions don't invoke other Strat functions within Strat program text.  For example, if a program has the following functions:

```strat
  foo (int):string
  bar ():int
```

There's no place for a Strat type checker to assert foo(bar()) is valid and bar(foo()) is not.  This doesn't mean Strat is beyond type theory--for instance, predicate types and sum types would be great additions:

```strat
Http { status > 200 } -> "./errorPage.html"

Http { method: "get"|"post" } -> myFunction
```

### Prior art

Engineers have made good headway with some of the challenges of describing events across organizations with the [OpenAPI Specification](https://www.openapis.org/).  Strat's type system notation shouldn't be YAML, but it can integrate with all of the other artifacts from the OAS ecosystem, and potentially produce an OAS YAML file.

Clojure's [Spec](https://clojure.org/guides/spec) shares many of the design goals of a Strat type system.

# AWS Substrate Performance Improvements (Ongoing)

Right now all http requests are sent to APIGateway and proxied to a lambda that routes.  The AWS SVS should implement routing inside APIGateway, and should proxy directly to s3 files to avoid lambda.  I suspect there's also some performance tweaks to be made around loading the AWS SDK lazier--Lambdas that don't load the AWS SDK typically take < 10ms while loading the AWS SDK seems to put a floor on the Lambda's time at 50ms.  Honestly, I haven't done the requisite profiling to make serious suggestions but I can tell things are much slower than they should be.

# Runtime Pattern Matching + Values

In the code:
```
Http { method: "get" } ->
```

{ method: "get" } represents a pattern that should be matched by the strat runtime.  Right now, this matching is done within the Http event source's proxy function, but there's no reason the runtime shouldn't handle this branching.  This feature is important to decrease the barrier to entry for writing custom sources.

Related to generic pattern definition is generic value definition, or expanding the string literal artifact with any JSON-y object.


# Dispatch Grammar Reduction

There are several different hard-coded grammar productions for dispatches and functions that should be generic.  Immagine the following:

```
Cron { "/5****" } -> "Every 5th minute",
Cron { "0****" } -> "Every hour" ->
  myFunc ():any -> "./myFunc.js"
```

This is a way events can be translated into constants then sent to an artifact. Or this:

```
Http { } -> "./myProxy.js" -> Other.myFn
```

For this to work, there's probably going to be pretty extensive changes to the .sa file format because the runtime would have to compose these functions and it would need instructions to do so.  Myabe some clever code-gen in stratc would simplify this.


# Strat.emit & Source Extensions

Immagine the usecase of a custom 404 page.  Here's some mock-y Strat that could do that:

```st
source CustomErrorHttp {
  include "Http"

  notFound ():any -> "<h1>custom 404 page</h1>"

  Http {} -> customHttp ():any -> "./customHttp.js"
}
```
```javascript
const Strat = require('strat');
module.exports = async event => {

  // Strat.emit creates a "CustomErrorHttp" event and attempts to route it
  // to a receiver
  // strat runtime tries to find a receiver through pattern matching
  // returns undefined if nobody matches
  // or maybe throws
  try {
    return Strat.emit(event);
  } catch (something) {
    return Strat('CustomErrorHttp.notFound')();
  }
};
```
```st
source CustomHttpConsumer {
  include "./CustomErrorHttp"

  CustomErrorHttp { method: "get" path: "*"} -> "<h1>thing</h1>"
}
```


# Foreign Source/Service Interface

Strat needs a way for developers to add source and service libraries that expose more exotic infrastructure that a particular substrate provides.  This problem is analagous to foreign function interfaces in normal languages.

# Config Settings

Right now the svs.json is very bare-bones.  This is great.  Config files suck.  A large feature set left out of Strat is fine-grained infrastructure configuration, which was intentional, but users will need it eventually, and svs.json is the perfect place to put them.  In Java, for example, if you want to set how much RAM the JVM should consume you use config files, and if you want to control the resources Strat uses you should use stratconifg.  Some obvious use cases:

  - I want a function to run by itself and not get collapsed from scope collapse, I should be able to specify in stratconfig "hey don't modify this"

  - I want to set fine-grained AWS config values like timeout and concurrency for specific resources.


# Language Support

Strat won't stay confined to javascript long term.  Below are common languages that Strat could support in the future.  For a language to be supported by Strat, it must have the following features:

  - Basic SDK support for all major cloud providers

Languages that are aligned with Strat's performance tradeoffs and user experience biases are higher priority.

## High Priority Languages

  - Python
  - Go (requires shapes complete)
  - JVM (requires shapes complete for Java & Kotlin)
  
## Low Priority Languages

  - .Net (if Azure substrate is completed this bumps up)
  - Rust
