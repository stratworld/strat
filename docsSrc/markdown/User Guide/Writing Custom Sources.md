# Writing Custom Sources

An event source's job is to bridge the outside world into Lit systems through events.  Some common events like Http and Cron are provided by the Lit standard library, but users may wish to create custom event sources to use more exotic infrastructure or to create custom domain based events.

There several facets of an event source and they have a role to play at compile time, deploy time, and runtime.

# Compile Time Responsibilities

While litc is compiling it needs to build a system that can handle your events.  To do this, litc creates new proxy functions that will recieve your events at runtime.  These proxy functions don't host user code, they host code from the event source and their job at runtime is to interpret events, format them into Lit friendly data formats if needed, and route events to the correct functions.  Proxy functions are entirely new functions within the service where their source is included, though they rarely incur overhead as they're optimized away with the [scope collapse optimization](https://lit.build/litc/Scope%20Collapse).  litc creates a proxy function for each service which includes your source, and invokes your builder for each service with just the events declared within that service.

Your source must make a javascript builder module available to litc:

```lit
source MySource {
  builder: "./myBuilder.js"
}
```

This builder module must be a function, and it will be invoked at compile time with information about event dispatches in a service.  It must return a data buffer that is the javascript code for the proxy function.

## Arguments to the builder:

The function you export from your builder will be called with an array of dispatches of the form

```javascript
[
  {
    //The name of the event source
    eventName: string

    //The config hash from the lit text
    eventConfig: { ... the string:string map as it appears in the lit text ... },

    //The fully qualified function name ex: "ServiceA.foo"
    functionName: string,

    //The artifact value as it appears in the lit text
    artifact: string,

    //Indicates if the function is a resource or not
    isResource: boolean
  }
]
```

Example:

Given the service:

```lit
service Foo {
  include "MySource"

  MySource { x: "y" } -> "./index.html"

  MySource { a: "b", c: "d" }
  MySource { m: "p" } ->
    foo ():any ->
      "./foo.js"
}
```

MySource's builder function will be invoked with the following:

```json
[
  {
    "eventName": "MySource",
    "eventConfig": {
      "x": "y"
    },
    "functionName": "Foo.{a SHA1 hash}",
    "artifact": "./index.html",
    "isResource": true
  },
  {
    "eventName": "MySource",
    "eventConfig": {
      "a": "b",
      "c": "d"
    },
    "functionName": "Foo.foo",
    "artifact": "./foo.js",
    "isResource": false
  },
  {
    "eventName": "MySource",
    "eventConfig": {
      "m": "p"
    },
    "functionName": "Foo.foo",
    "artifact": "./foo.js",
    "isResource": false
  }
]
```

Note: when multiple events are dispatched to a single function they show up as discrete events in the arguments to builder.

# Deploy Time Responsibilities

todo

# Runtime Responsitiblities

todo
