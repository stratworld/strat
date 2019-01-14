/*
Host collapse optimization

Observations:
  Network hops are somewhat expensive (1-5ms)
  Cold starts are extremely expensive (100ms+)
  Loading heavy dependencies (aws-sdk) is extremely expensive (10ms+)

Goal:
  Reduce all of the above by running functions on close-to-hand (the same) invocations.

Assumption:
  If two functions are inside a scope together, its better to run them on the same host

Assumption:
  There will be things that prevent running two functions on the same lambda.
    - their hosts are different languages
    - their host would be over capacity
    - they have different permission roles ?
    - only one type of event can be received by a host.  The host can't know which
      function to send the event to if there are more than one event types

  Potential reason in the future:
    - the user specifies the function should be isolated

Assumption:
  Functions will be well behaved:
    - They don't write to the filesystem
    - They don't declare global variables

Tactics:
  Given two hosts A and B, combine them if:
    (1) They share the same runtime AND
    (2) at least one function in A shares a scope with at least one function in B.
    (3) at most one host receives events
  The graph of functions will be a connected graph because of how includes work, so we can ignore (2).
  Let the backend split hosts up as it sees fit
  Scopes remain unchanged
*/

module.exports = function (ir) {
  ir.hosts = collapseHosts(ir.hosts);
  return ir;
}

function collapseHosts (hosts) {
  return hosts
    .sort(httpHostsFirst)
    .reduce((newHosts, nextHost) => {
      const hostForRuntime = newHosts[nextHost.runtime];
      if (nextHost.runtime === undefined) {
        // if the host doesn't have a runtime, don't collapse it
        newHosts[nextHost.name] = nextHost;
      } else if (hostForRuntime === undefined) {
        // never seen this runtime, its where we'll collapse hosts of this runtime
        newHosts[nextHost.runtime] = nextHost;
      } else if (hostForRuntime.events.length > 0
        && nextHost.events.length > 0) {
        // seen this runtime but conflicting receivers
        // we won't add functions to this host, so just add it
        newHosts[nextHost.name] = nextHost;
      } else {
        // seen this runtime and its eligible to collapse
        hostForRuntime.artifacts.push(nextHost.artifacts[0]);
      }
      return newHosts;
    }, {})
    .values();
}

/*
This is another optimization:
Since only a single event can be received by a host, there will be several
hosts for a single runtime.  Ideally, we'd want to stack up functions into
whichever host is receiving the most time sensitive event type.  Most of the time
that event type will be HTTP.  Given the algorithm in cllapseHosts, the first
host of a runtime gets the most functions, so we want the first host for each
runtime to be the Http proxy.
*/
function httpHostsFirst (A, B) {
  return (A.events !== undefined
    && A.events[0] !== undefined
    && A.events[0].type === 'Http')
    ? -1
    : 0;
}