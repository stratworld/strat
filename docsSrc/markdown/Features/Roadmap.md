# Roadmap

The following features are presented in rough priority order.  The work required varies greatly between epic, with some requiring language development expertise and others DevOps skills and experience with proprietary clouds.

# Namespaces

We essentially just have textual inclusion (not exactly but close) right now, which is fine for MVP but will suck long term.

# Runtime Instrumentation & Insight

When people first encounter Strat their immediate reservations are usually around how Strat impacts traditional operational tasks and best practices like monitoring, alarming, and logging.  Also, nearly everyone wants to know what "stuff" gets built--they want to get their hands on the infrastructure.  Strat has to walk the line between making users comfortable (and effective) in the short term while working to make these concerns obsolete in the long term.  System stack traces are a great step in this direction, and they're a perfect example of something Strat is better positioned to do relative to traditional software.

# std Libraries

## stdBlob

Nearly every language has a file system standard library.  The "file system" of the cloud may very well be blob storage.  It should be fairly straightforward to provide a get/put API that works for every cloud and single machines.

## stdSQL

Much more ambitious than stdBlob is an SQL service that's always available on any Strat substrate (think "give me the SQL database on this cloud machine").  From a point of view disconnected from the mountain of human effort spent on operating SQL instances, it seems possible.  Ambitious, but possible.

## stdLog

What does "console.log" or "println" translate to in a cloud?  The requirements for this will evolve based on early users' needs for debugging and logging.

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

Some type system properties, and notes along with them:

strong
  - When deserializing events we'll be beholden to the target language's type system--its best to select the stricter option (vs weak) so we don't conflict with target languages' type systems.
static
  - We'll need to generate types at compile time for component languages
structural
  - Nominal type systems have fallen out of favor with software engieers recently for good reason.  Structural systems deal with changing data better than nominal systems.  With a structural type system users can aopt changing APIs at their own pace (assuming only additions are made), and API designers can add functionality freely without breaking existing API surface area.  TODO: how do these structural types map to nominal types in, for instance, Java?
non-behavioral
  - Events can't (and shouldn't) contain behavior like functions.

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

# "public by" / Custom connection semantics / Versioning

Early versions of the compiler had a public keyword that would generate a bunch of Strat code that 3rd parties could use to include your running service.  The long term version for this is to allow users to provide connection semantics as a sort of mini-SDK that Strat would make available and download for 3rd parties.  I removed it from the compiler because it wasn't complete or thought-through enough, with the major gap bieng how users would version their "public" apis.

# Browser Host

This is so that users can call Strat("Books.getBooks") inside a browser and a Strat browser host figures out how to make the API request.  100% doable.  Great customer experience.  Potentially more performant than what a user could build by hand by utilizing direct Lambda calls.

This also opens the way for people to write client-side "services" that can be included and run inside a user's browser.  The big question here is how does Strat know / how does the user specify that a particular service should be client-side.

# Config Settings

Right now the svs.json is very bare-bones.  This is great.  Config files suck.  A large feature set left out of Strat is fine-grained infrastructure configuration, which was intentional, but users will need it eventually, and svs.json is the perfect place to put them.  In Java, for example, if you want to set how much RAM the JVM should consume you use config files, and if you want to control the resources Strat uses you should use stratconifg.  Some obvious use cases:

  - I want a function to run by itself and not get collapsed from scope collapse, I should be able to specify in stratconfig "hey don't modify this"

  - I want to set fine-grained AWS config values like timeout and concurrency for specific resources.


# Language Support

Strat won't stay confined to javascript long term.  Below are common languages that Strat could support in the future.  Languages that are aligned with Strat's performance tradeoffs and user experience biases are higher priority.

## High Priority Languages

  - Python
  - Go (requires shapes complete)
  - JVM (requires shapes complete for Java & Kotlin)

## Low Priority Languages

  - .Net (if Azure substrate is completed this bumps up)
  - Rust
