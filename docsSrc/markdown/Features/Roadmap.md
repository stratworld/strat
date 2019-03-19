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

## Prior art

Engineers have made good headway with some of the challenges of describing events across organizations with the [OpenAPI Specification](https://www.openapis.org/).  Strat's type system notation shouldn't be YAML, but it can integrate with all of the other artifacts from the OAS ecosystem, and potentially produce an OAS YAML file.

Clojure's [Spec](https://clojure.org/guides/spec) shares many of the design goals of a Strat type system.

# Foreign Source/Service Interface

Strat needs a way for developers to add source and service libraries that expose more exotic infrastructure that a particular substrate provides.  This problem is analagous to foreign function interfaces in normal languages.

# Config Settings

Right now the stratconifg.json is very bare-bones.  This is great.  Config files suck.  A large feature set left out of Strat is fine-grained infrastructure configuration, which was intentional, but users will need it eventually, and stratconifg is the perfect place to put them.  In Java, for example, if you want to set how much RAM the JVM should consume you use config files, and if you want to control the resources Strat uses you should use stratconifg.  Some obvious use cases:

  - I want a function to run by itself and not get collapsed from scope collapse, I should be able to specify in stratconfig "hey don't modify this"

  - I want to set fine-grained AWS config values like timeout and concurrency for specific resources.


# Substrate Support

Any infrastructure that can satisfy the [function abstraction](../Specification/Function%20Infrastructure) is an eligible substrate.  For a substrate to be "complete", it must satisfy the [core infrastructure requirements](../Specification/Infrastructure) as well as implement each standard source.  At the moment, Azure is the highest priority new substrate and is under active development.

# Language Support

Strat won't stay confined to javascript long term.  Below are common languages that Strat could support in the future.  For a language to be supported by Strat, it must have the following features:

  - Basic SDK support for all major cloud providers
  - Runtime support on serverless for all major cloud providers

Languages that are aligned with Strat's performance tradeoffs and user experience biases are higher priority.

## High Priority Languages

  - Python
  - Go (requires shapes complete)
  - JVM (requires shapes complete for Java & Kotlin)
  
## Low Priority Languages

  - .Net (if Azure substrate is completed this bumps up)
  - Rust
