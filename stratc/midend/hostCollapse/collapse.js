/*

  1) Rename isomorphic scopes (done in scopereduce)
  2) Create a host for each scope for each event in that scope
    EX, if a scope has 3 functions and 2 events, the result hosts will be:
      1 host with the proxy for a single event, and between 0 >= n >= 3 of
        the 3 natural functions declared in that scope
      1 host with the proxy for the other event and 3 - n of the 3
        natural functions declared in that scope

*/

module.exports = deps => ir => {
  ir.hosts = collapseHosts(ir.hosts);
  return ir;
}

function collapseHosts (hosts) {
  return hosts
    .sort(httpHostsFirst)
    .reduce((newHosts, nextHost) => {
      const hostHash = nextHost.runtime !== undefined
        ? `${nextHost.runtime}${nextHost.artifacts[0].scope}`
        : nextHost.name;
      if (newHosts[hostHash] && nextHost.eventType === undefined) {
          newHosts[hostHash].artifacts = newHosts[hostHash].artifacts
            .concat(nextHost.artifacts);
      } else {
        newHosts[hostHash] = nextHost;
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

todo: What happens when there are multiple declarations of a single event source
within one system?  EX: 2 files have include "Http"
*/
function httpHostsFirst (A) {
  return (A.events !== undefined
    && A.events[0] !== undefined
    && A.events[0].type === 'Http')
    ? -1
    : 0;
}