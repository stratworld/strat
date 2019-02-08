# Functions

Functions are the computational components of Lit, and they are the vehicle which runs user code in a Lit system.

# Functions within the Lit Language

Functions must be defined within a service block, and they follow the grammar nonterminals dispatch or function:

```
function
  functionName STRING

dispatch
  events functionName? STRING
  events IDENTIFIER "." IDENTIFIER  

events
  event+ "->"

functionName
  IDENTIFIER signature? "->"

signature
  "(" shape? ")" ":" shape
```

Examples:

```lit
foo ():any -> "./foo.js"
fooson -> "./fooson.json"
Http { method:"get" path:"/" } -> "./fooson.json"
Http { method:"get" path:"/" } -> foo ():any -> "./fooson.json"
Http { method:"get" path:"/" } -> foosonRequest -> "./fooson.json"
Http { method:"get" path:"/" } -> OtherService.otherFoo
```

Functions without a signature are considered resources and have the same behavior as normal functions except they always produce the artifact's data as their result.

The name of the function (the identifier preceding the signature) must be unique within a service, and the function's fully qualified name is a conjunction of a function name and its service name.  The syntax of a fully qualified name can change based on context, but within in the Lit language, it is represented as SERVICENAME "." FUNCTIONNAME.

Type signatures are of the form "(" input ")" ":" output.  It should be noted that only a single input and output can be produced.  Functions that don't produce a return value should use the type void.

Component software is written on a one-to-one basis with Lit functions, and users can expect component code to run isolated from previous invocations, subsequent invocations, and other component's invocations.  In practice this is very difficult, so hosts and substrates should inform the user in what circumstances this promise is unreasonable.


# Implementing Functions: The Function Abstraction

A Lit function implementation must satisfy three broad requirements:

  1. The static name requirement: It must have an unchanging, reasonably scoped(\*) name which can be used to resolve the function's implementation for the entirety of the function's life.  **This name must be knowable before the function exists, and any operation to create the function and assign it this name must succeed within normal operation**.  Examples:

    - An absolute filepath on a single machine
    - A URL
    - An AWS Lambda function name
    - An AWS bucket + item name


  2. The scalability requirement: While executing n invocations concurrently, it must execute the n+1th invocation with the same latency profile as the first n for reasonable(\*) values of n.
  3. The resilliency requirement: A function cannot change its computation for an invocation based on previous invocations.

\*What is reasonable changes based on substrate context.  Any substrate should specify what the limits of "reasonable" for scope and scalability are.  For instance, the AWS substrate is scoped globally and has a very large (1M+ concurrent invocations) value of n, while the local substrate is scoped to a single machine with low values of n.

These three requirements allow Lit to create a static networking layer between functions using only information available at compile time.  Then, this networking layer can be baked into the .sys file format and consumed by any substrate at deploy time.  Additionally, since substrates supply software to invoke functions, user code can deal with only the abstract notion of a function and let Lit's networking layer resolve implementation details determined at compile time.

## Implementing Resources

From an abstract perspective, resources are just functions that don't need to execute.  From a practical perspective, this means implementing resources is much more trivial, and substrates should use different infrastructure for resources than functions.

# Functions from the Component Perspective

Component software only deals with abstract functions, and the host satisfies the following two function interfaces.

## The Calling Function Interface

For component software to invoke another function, the host must supply the following:

  1) A way to resolve a fully qualified function name (some conjunction of the function name and service name from the Lit text the function was defined in) to executable code in the hosts's programming environment.  For example, in the NodeJS host, a user would resolve ServiceA.foo by calling 
  ```javascript
    const foo = Lit('ServiceA-foo');
  ```

  2) The executable code from 1 should accept a single event as input and potentially return a single event as output and should be asynchronous.  Continuing the NodeJS example
  ```javascript
    const result = await foo(input);
  ``` 

Lit is not perscriptive in how a host fulfills these requirements--object oriented hosts may use classes and design patterns that look different than the javascript example above.

## The Callee Function Interface

For component software to recieve events, it must satisfy the callee interface:

  Each component artifact must export a single function that accepts a single argument event and may return a single event asynchronously (todo - what other stuff can we commit to supplying to ALL components ex: function implementation details, raw events, etc.).
