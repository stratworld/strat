# Extern

When building a source that will recieve events external to your Strat system, you must specify an Extern dispatch function so Strat knows which component in your source responds to these external events.

### Usage:

```
source MySource {
  include "Extern"
  Extern -> reception (any):any -> "./myReception.js"
}
```

Extern is a special source that isn't actually implemented in Strat and doesn't take a pattern.  When the Strat runtime cannot identify an event, it assumes its an external event and sends it, undisturbed, to the Extern function.  Then, the response from the Extern function is sent back as a response to the Extern event.

Stratc's implementation of Extern places only a single Extern event on each infrastructure component since Strat has no way to differentiate between Extern events.  This is one of the major reasons to split software components into multiple pieces infrastrucutre, so users should be discerning in their use of Extern.