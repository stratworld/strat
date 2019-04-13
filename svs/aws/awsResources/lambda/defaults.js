module.exports = {
  "Handler": "strat_generated_host_entry.handler",
  "Description": "built by stratc",

  /*
  3 second default timeout is too slow for cold starts in serial lambda calls.
  Each cold start is ~1900ms in preliminary testing, which leads to a 3.8s
  cold start for 2x serial lambdas.  Setting a perfect timeout here is impossible;
  this need to be surfaced to the end user.
  */
  "Timeout": 20,

  /*
  128 is totally appropriate RAM for operations that don't load a large bundle.
  We might want to switch this around based on how large the bundle is.
  A 1MB bundle was paging with 128 RAM and "maxing out" at ~170 according
  to the lambda console.
  */
  "MemorySize": 256
};