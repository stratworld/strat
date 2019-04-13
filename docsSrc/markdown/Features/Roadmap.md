# Roadmap

The following features are presented in rough priority order.  The work required varies greatly between epic, with some requiring language development expertise and others DevOps skills and experience with proprietary clouds.

# Runtime Instrumentation & Insight

When people first encounter Strat their immediate reservations are usually around how Strat impacts traditional operational tasks and best practices like monitoring, alarming, and logging.  Also, nearly everyone wants to know what "stuff" gets built--they want to get their hands on the infrastructure.  Strat has to walk the line between making users comfortable (and effective) in the short term while working to make these concerns obsolete in the long term.

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

Right now all http requests are sent to APIGateway and proxied to a lambda that routes.  Its not clear what APIGateway brings to the table for Strat other than a massive latency tax.  The optimal solution is likely some combination of direct Lambda calls, CloudFront->Lambda, and CloudFront->s3.  This is all pretty in-the-weeds of AWS, but the current state of affairs of 500ms for a simple api call is not acceptable for a production system, and if we're to make good on "better infrastructure than you're making by hand" a realistic goal should be TP99 <50ms api calls (assuming they terminate in a single lambda, and assuming the client is in a place close-ish to an AWS datacenter).

# "public by" / Custom connection semantics

Right now when a user adds the public keyword to a function they get a bare-bones https based rest client.  Users will want to specify how clients will connect to their systems to add authentication/authorization.

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

My best idea for how this would work is dynamically generating composed pipelines in stratc:

```st
service Composition {
  Http { } -> "./myProxy.js" -> Other.myFn
}
```

Would become:

```
service Composition {
  Http {} -> compositionPipeline_AB ():any -> 
    "./strat_generated_Composition_AB.js"
  compositionPipeline_AB_A ():any -> "./myProxy.js"
  compositionPipeline_AB_B ():any -> Other.myFn
}
```
 Where "strat\_generated\_Composition\_AB.js" is some buffer generated at compile time that will compose the two functions A and B.

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

# Browser Host

This is so that users can call Strat("Books.getBooks") inside a browser and a Strat browser host figures out how to make the API request.  100% doable.  Great customer experience.  Potentially more performant than what a user could build by hand by utilizing direct Lambda calls.

This also opens the way for people to write client-side "services" that can be included and run inside a user's browser.  The big question here is how does Strat know / how does the user specify that a particular service should be client-side.

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
