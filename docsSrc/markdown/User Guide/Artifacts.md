#Artifacts

Artifacts are the terminal element in a function or dispatch definition, and they must always be a string.  They're the user code that gets deployed and run in response to events.  Legal artifacts are:
  
  - A string literal EX: "Hello world"

  - A relative file path EX: "./getBooks.js"

When a relative file path is contained within a file that was accessed from the internet it is interpreted as a relative url path.  For instance, if the following data was downloaded from the url "https://stratosphere.strat.world/public/Sales.st":

```
service Sales {
  getSales ():any -> "./salesClient.js"
}
```

Strat will attempt a get request to "https://stratosphere.strat.world/public/salesClient.js" to download the artifact data for getSales.

Artifacts should be reasoned about as single file binaries.  Most languages have the capacity to create single file artifacts through build systems like Make, Webpack, javac, etc.  Those build tools should be run before Strat to create easily deployable and runnable artifacts for Strat to consume.  It is not Strat's responsibility to build component software.

At compile time artifacts are loaded and placed into a .sa file, and users should be mindful of how large their artifacts are to keep .sa files to reasonable sizes.

# Limits

Some substrates may have restrictions on how large code bundles can be for particular infrastructure.  In the long term Strat, may be smart enough to avoid this infrastructure for large artifacts but it is not today, so users should be aware of artifact size limits for their target substrate.  The AWS substrate deploys artifacts to Lambda, which has a 50MB limit for code bundles.  Users may hit this limit with smaller artifacts because strat may deploy multiple artifacts to the same Lambda.  If this happens, users can get more space by splitting their artifacts into different scopes at the tradeoff of extra network hops and Lambda invocations.
