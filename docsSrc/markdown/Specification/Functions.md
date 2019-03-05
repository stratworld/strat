# Functions

Functions are the computational components of Strat, and they are the vehicle which runs user code in a Strat system.  Broadly speaking, a function is a piece of infrastructure that accepts a bundle of code and executes it in response to an event.  This is an intentionally broad definition--much broader than the du jour "Functions as a Service" defintion.  Strat is a little more opinionated about what exactly can be a function in practice, and explicit documentation can be found in the "Implementing Functions: the Function Abstraction" section below.  What fits this definition may be surprising; things ranging from plain files to virtual machines to AWS Lambdas are acceptable function for Strat.

# Functions within the Strat Language

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

```strat
foo ():any -> "./foo.js"
fooson -> "./fooson.json"
Http { method:"get" path:"/" } -> "./fooson.json"
Http { method:"get" path:"/" } -> foo ():any -> "./fooson.json"
Http { method:"get" path:"/" } -> foosonRequest -> "./fooson.json"
Http { method:"get" path:"/" } -> OtherService.otherFoo
```

Functions without a signature are considered resources and have the same behavior as normal functions except they always produce the artifact's data as their result.

The name of the function (the identifier preceding the signature) must be unique within a service, and the function's fully qualified name is a conjunction of a function name and its service name.  The syntax of a fully qualified name can change based on context, but within in the Strat language, it is represented as ```SERVICENAME "." FUNCTIONNAME```.  A function's name is used by other components when they wish to invoke the function.  Resources without function names cannot be invoked by components--they are only useful to respond to events.

Type signatures are of the form ```"(" input ")" ":" output```.  It should be noted that only a single input and output can be produced.  Functions that don't produce a return value should use the type void.

Strat functions host a single piece of component software each, and users can expect component code to run isolated from previous invocations, subsequent invocations, and other functions' invocations.  In practice this is very difficult, so hosts and substrates should inform the user in which circumstances this promise is unreasonable.  Components should do their best to not cause lasting side effects within their execution context.  Examples of bad component behavior include:

  - Assigning global variables that persist within the language runtime
  - Using singletons to perserve state
  - Writing to the file system

All state that an application needs to keep should be kept outside of the Strat system and in stateful peripheral systems such as inside a database or a user's browser cookies.


# Implementing Functions: The Function Abstraction

A Strat function implementation must satisfy three requirements:

  1. The static name requirement: It must have an unchanging, unique name across a reasonable scope(\*) which can be used to resolve the function's implementation for the entirety of the function's life.  **This name must be knowable before the function exists, and any operation to create the function and assign it this name must succeed within normal operation**.  Examples:

    - An absolute filepath on a single machine
    - A URL
    - An AWS Lambda function name
    - An AWS bucket + item name


  2. The scalability requirement: While executing n invocations concurrently, it must execute the n+1th invocation with the same latency profile as the first n for reasonable(\*) values of n.
  3. The resilience requirement: A function cannot change its computation for an invocation based on previous invocations.

\*What is reasonable changes based on substrate context.  Any substrate should specify what the limits of "reasonable" for scope and scalability are.  For instance, the AWS substrate is scoped globally and has a very large (1M+ concurrent invocations) value of n, while the local substrate is scoped to a single machine with low values of n.

The term [high availability](https://en.wikipedia.org/wiki/High_availability) encapsulates the above requirements but is nebulous and can confer requirements that are not nessecary for Strat functions.

The static name requirement allows Strat to create a static networking layer between functions using only information available at deploy time.  The scalability and resilience requirements ensure that that networking layer remains correct for the duration of a Strat system's lifetime.

A notable ommision from these requirements are any message and event delivery guarantees which are common in definitions of availability.  The above requirements are required for Strat to construct a system--they don't confer any functionality guarantees.  If a substrate drops messages half the time, a Strat system built on top will too.  In a practical sense, this mean Strat assumes correct message delivery and doesn't have its own layer of network retries above whatever a substrate's SDK has.

## Implementing Resources

From an abstract perspective, resources are just functions that don't actually execute code.  This means implementing resources is much simpler, and substrates should use different infrastructure for resources than functions.  The AWS substrate implements functions as Lambdas and resources as S3 items.

## Examples of Function Implementations

A discerning eye may have noticed that nearly everything can satisfy the above requirements given common values of n.  The static name requirement is easy to meet since URLs suffice and assigning a URL to a server is routine.  Daemons can restart services to meet the resilience requirement, and most users' business requirements for concurrency are easilly met with $10 per month (though they may not think so). Strat's value then, is allowing users to program to an abstraction that can scale without committing to scalable infrastructure.

For n=1 and scoped to a local machine, a user's file system is an eligible Strat substrate.

For 1 < n < 10000 single servers can run the local substrate with a daemon to operate production architecture.

Only for very large concurrency requirements do users need Functions as a Service infrastructure like AWS Lambda.  However, users may find running their Strat systems on FAAS confers other benefits like reduced operational load and pay-as-you-go business models.

# Functions from the Component Perspective

Component software only deals with abstract functions, and the host satisfies the following two function interfaces.

## The Calling Function Interface

For component software to invoke another function, the host must supply the following:

  1) A way to resolve a fully qualified function name (some conjunction of the function name and service name from the Strat text the function was defined in) to executable code in the hosts's programming environment.  For example, in the NodeJS host, a user would resolve ServiceA.foo by calling 
  ```javascript
    const foo = Strat('ServiceA-foo');
  ```

  2) The executable code from 1 should accept up to a single event as input and return up to a single event as output and should be asynchronous.  Continuing the NodeJS example
  ```javascript
    const result = await foo(input);
  ``` 

Strat is not perscriptive in how a host fulfills these requirements--object oriented hosts may use classes and design patterns that look different than the javascript example above.

## The Callee Function Interface

For component software to recieve events, it must satisfy the callee interface:

  Each component artifact must export a single function that accepts a single argument event and may return a single event asynchronously (todo - what other stuff can we commit to supplying to ALL components ex: function implementation details, raw events, etc.).
