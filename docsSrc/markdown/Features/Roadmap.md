# Roadmap

The following features are presented in rough priority order.  The work required varies greatly between epic, with some requiring language development expertise and others DevOps skills and experience with proprietary clouds.

# Shapes (types) & OpenAPI Integration

A core responsibility of Lit is to help users describe and communicate events.  The way programming languages have historically addresed this need is with type systems.  Lit will have a type system for events, but typing events will be very different from typing in memory data structures.

Events

  - (1) Don't exist on a single machine--they are serialized by nature
    - (1.1) and they never contain behavior
  - (2) Are defined and consumed in different software applications
    - (2.1) and by different people (often 3rd parties)
    - (2.2) and are versioned, deployed, and specified in different places
    - (2.3) and change schemas at a different rate than single machine software
  - (3) Are often read and manipulated directly by software engineers

Falling out of these charactaristics, Lit's type system should:

  - A) Have a small delta between program text notation and serialized data representation, which can be assumed is JSON (1, 3)
  - B) Be flexible in response to change (2)
  - C) Be externalizable and have a separate lifespan than component software (2)

Nobody has been particularly successful at addressing all 3 of these concerns--there's plenty of room for invention.  Thankfully, concern C runs in the same grain as the rest of Lit, which is a critical advantage over previous attempts which had types sit in the same ecosystem as component software.

Its worth mentioning that traditional type algebra and much of type systems theory is not applicable to Lit because Lit functions don't invoke other Lit functions within Lit program text.  For example, if a program has the following functions:

```lit
  foo (int):string
  bar ():int
```

There's no place for a Lit type checker to assert foo(bar()) is valid and bar(foo()) is not.  This doesn't mean Lit is beyond type theory--for instance, predicate types and sum types would be great additions:

```lit
Http { status > 200 } -> "./errorPage.html"

Http { method: "get"|"post" } -> myFunction
```

## Prior art

Engineers have made good headway with some of the challenges of describing events across organizations with the [OpenAPI Specification](https://www.openapis.org/).  Lit's type system notation shouldn't be YAML, but it can integrate with all of the other artifacts from the OAS ecosystem, and potentially produce an OAS YAML file.

Clojure's [Spec](https://clojure.org/guides/spec) shares many of the design goals of a Lit type system.


# Dependencies & Includes

Like shapes, dependencies in Lit will require very different solutions than those in other languages.  There are two dependency stories in Lit:
  
  - How to resolve source libraries
  - How to resolve service dependencies

Source libraries should be resolved in line with how other languages resolve libraries: pull down source code and make it available at compile time on the user's machine.

Service dependencies present an entirely different problem.  Services are static and often have only a single "implementation" per environment.  The work being done on [Deno](https://github.com/denoland/deno) for its module system looks promising.

# Substrate Support

Any infrastructure that can satisfy the [function abstraction]("/Specification/Function%20Infrastructure") is an eligible substrate.  For a substrate to be "complete", it must satisfy the [core infrastructure requirements]("/Specification/Infrastructure") as well as implement each standard source.  At the moment, Azure is the highest priority new substrate and is under active development.

# Language Support

Lit won't stay confined to javascript long term.  Below are common languages that Lit could support in the future.  For a language to be supported by Lit, it must have the following features:

  - Basic SDK support for all major cloud providers
  - Runtime support on serverless for all major cloud providers

Languages that are aligned with Lit's performance tradeoffs and user experience biases are higher priority.

## High Priority Languages

  - Python
  - Go\* (requires shapes complete)
  - JVM (requires shapes complete for Java & Kotlin)
  
## Low Priority Languages

  - .Net (if Azure substrate is completed this bumps up)
  - Rust

\* Despite not having generics and being a "systems language" biased for performance, Go is a very popular language in the serverless space and enjoys rich support as well as the fastest cold start times.  While I don't think Go is the right tool for _any_ job, I can't deny its priority for Lit's users.