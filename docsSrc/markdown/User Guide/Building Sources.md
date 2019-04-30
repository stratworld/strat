# Building Strat Sources

Users can build sources in Strat that emit events that other sources and services can subscribe to.

## Extern

Many sources will need to recieve events from the outside world and bring them into the Strat ecosystem.  Its important that every external event be directed to the correct function without mutation, so Strat provides a special source "Extern" that lets users tell Strat a particular function will handle outside events.  Here's an example:

```st
source MySource {
  include "Extern"

  Extern -> reception (any):any -> "./mySourceReception.js"

  //...
}
```

__Note:__ Strat doesn't know how to interpret external events--it must have an Extern function to send things it can't identify, so if your source is connected to the outside world it must provide an Extern function.  Additionally, your source can't have multiple extern functions, and stratc will only place a single extern function on each piece of infrastructure since it couldn't pick wich function to send an event to.

## Birth

After a source is deployed, the Birth event is dispatched to the dployed system.  Responding to the Birth event is the opportunity to extend the deployment process by connecting external systems to the deployed Strat infrastructure.  The data contained inside the Birth event is substrate specific but usually contains infrastructure implementation details like lambda function arns.

## Emit

To emit an event a source must call it's "emit" function, which it can access via Strat('this.emit').  If no emit function is provided on a source stratc injects the standard emit function, which just iterates through a source's subscribers looking for a match using the match function.  Sources may specify that they are "async" by putting the "async" keyword before "source" in its declaration:

```st
async source MySource { ... }
```

The async keyword changes the behavior of standard emit--async sources can have multiple matches per event, while non-async sources will throw an error of multiple subscribers match to a single event.  Also, async emit doesn't return the responses of the matched subscriber functions.

Users can supply their own emit function and use it to call subscribers directly.

Examples:

```js
//within the source "MySource"
const Strat = require('strat').getResolver();
const emit = Strat('this.emit');

module.exports = rawEvent => {
  /*
    Using stdEmit and stdMatch, subscribers with the following patterns
    will be called:

    MySource { foo: any } ->
    MySource { foo: "abc" } ->
    MySource ->
    MySource any ->
  */
  return emit({
    foo: "abc"
  });
}
```

## Match

Match is a function that can tell if a subscriber's pattern matches the event.  Like emit, match is injected into sources that do not provide their own, and can be implemented by source authors directly.  The standard match function does some basic structural type matching based on the value of the event and pattern.  Standard match returns a map that indicates if a match occured:

```js
{
  matched: true|false,
  event: event
}
```

## Reflection

Every source and service gets its own reflect function injected by stratc that has information about its declaration, and in the case of sources, its subscribers.  Standard emit uses this reflect function to determine who to do matching against.  The reflect function returns a good bit of information, and it can be referenced by Strat('this.reflect').  Here's a sample reflect response:

```js
{
  isAsync: true|false,
  name: "serviceOrSourceName",
  declaredFile: "the absolute file path this was declared in",
  subscribers: [
    pattern: {},
    reference: 'Other.fn'
  ],
  functions: [
    //every function on the source or service
    {
      "name": "the function name",
      "line": 10,
      "media": ".js",
      "isResource": true|false
    }
  ]
}
```

## Scope

Scope for sources behaves differently from services--sources get access to every function that subscribes to them, even if they are not included.  This is because sources call subscribers directly, so they need permissions to do so.
