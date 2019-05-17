# Roadmap

The following features are presented in rough priority order.  The work required varies greatly between epic, with some requiring language development expertise and others DevOps skills and experience with proprietary clouds.

# Namespaces

Strat essentially just has textual inclusion (not exactly but close) right now, which is fine for MVP but will suck long term.

# Runtime Instrumentation & Insight

When people first encounter Strat their immediate reservations are usually around how Strat impacts traditional operational tasks and best practices like monitoring, alarming, and logging.  Also, nearly everyone wants to know what "stuff" gets built--they want to get their hands on the infrastructure.  Strat has to walk the line between making users comfortable (and effective) in the short term while working to make these concerns obsolete in the long term.  System stack traces are a great step in this direction, and they're a perfect example of something Strat is better positioned to do relative to traditional software.

# std Libraries

### Blob

Nearly every language has a file system standard library.  The "file system" of the cloud may very well be blob storage.  It should be fairly straightforward to provide a get/put API that works for every cloud and single machines.

### Cron

A source to include that dispatches events on a time schedule.

### Queue

### SQL

Much more ambitious than Blob is an SQL service that's always available on any Strat substrate (think "give me the SQL database on this cloud machine").  From a point of view disconnected from the mountain of human effort spent on operating SQL instances and fussing with ORMs, it seems possible--ambitious, but possible.

### Log

What does "console.log" or "println" translate to in a cloud?  The requirements for this will evolve based on early users' needs for debugging and logging.  This is deceptively complex--there is no nice terminal user interface.  The user interface may be something like an ElasticSearch console or some kind of log stream.

### Webhook

This will be the root of many user sources.  An std module here would encapsulate setting up the Http endpoints and the Birth handshake between the two systems.

# Shapes (types) & OpenAPI Integration

A core responsibility of Strat is to help users describe and communicate events.  Strat will have a type system for events, but typing events will be very different from typing in-memory data structures:

Events

  - (1) Don't exist on a single machine--they are serialized by nature
    - (1.1) and they never contain behavior
  - (2) Are defined and consumed in different software applications
    - (2.1) and by different people (often 3rd parties)
    - (2.2) and are versioned, deployed, and specified in different places
    - (2.3) and change schemas at a different rate than single machine software
  - (3) Are often read and manipulated directly by software engineers

Falling out of these characteristics, Strat's type system should:

  - A) Have a small delta between program text notation and serialized data representation, which can be assumed is JSON (1, 3)
  - B) Be flexible in response to change (2)
  - C) Be externalizable and have a separate lifespan than component software (2)

Nobody has been particularly successful at addressing all 3 of these concerns--there's plenty of room for invention.  Thankfully, concern C runs in the same grain as the rest of Strat, which is a critical advantage over previous attempts which had types sit in the same ecosystem as component software.

As of now, I'd like Strat's type system to be:
  -strong
  -static
  -structural
  -non-behavioral
  -with predicates ("n > 0" as a subtype of the type "number"):

```strat
Http { status > 200 } -> "./errorPage.html"

Http { method: "get"|"post" } -> myFunction
```

### Prior art

Engineers have made good headway with some of the challenges of describing events across organizations with the [OpenAPI Specification](https://www.openapis.org/).  Strat's type system notation shouldn't be YAML, but it can integrate with all of the other artifacts from the OAS ecosystem, and potentially produce an OAS YAML file.

Clojure's [Spec](https://clojure.org/guides/spec) shares many of the design goals of a Strat type system.

# "public by" / Custom connection semantics / Versioning

Early versions of the compiler had a public keyword that would generate a bunch of Strat code that 3rd parties could use to include your running service.  The long term version for this is to allow users to provide connection semantics as a sort of mini-SDK that Strat would make available and download for 3rd parties.  I removed it from the compiler because it wasn't complete or thought-through enough, with the major gap being how users would version their "public" apis.

# Browser Host

This is so that users can call Strat("Books.getBooks") inside a browser and a Strat browser host figures out how to make the API request.  100% doable.  Great customer experience.  Potentially more performant than what a user could build by hand by utilizing direct Lambda calls.

This also opens the way for people to write client-side "services" that can be included and run inside a user's browser.  The big question here is how does Strat know / how does the user specify that a particular service should be client-side.

# Source/Service inclusion parameters

When including a source a user (and the source's author) may wish to provide additional information about the usage of the source.  Nothing has made it into Strat that would do this because it treads close to Turing complete-y and computation language-y features like closures and objects.  I think this is a necessary feature long term but great care needs to be taken when deciding how data and configuration should move through Strat.

# Language Support

Strat won't stay confined to javascript long term.  Below are common languages that Strat could support in the future.  Languages that are aligned with Strat's performance tradeoffs and user experience biases are a higher priority.

## High Priority Languages

  - Python
  - Go (requires shapes complete)
  - JVM (requires shapes complete for Java & Kotlin)

## Low Priority Languages

  - .Net (if Azure substrate is completed this bumps up)
  - Rust
