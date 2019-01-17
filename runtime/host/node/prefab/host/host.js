module.exports = function (event, context, cb) {
  const Lit = require('lit');
  const callee = event === undefined || event._litCallee === undefined
    ? undefined
    : event._litCallee;
  const calleeFunction = Lit(callee);
  if (callee === undefined) {
    invokeDefault(calleeFunction, event, cb);
  } else {
    invokeHosted(calleeFunction, event, cb);
  }
}

//correct
function invokeDefault (callee, event, cb) {
  callee(event)
    .then(result => cb(null, result))
    .catch(error => cb(error));
}

function invokeHosted (callee, event, cb) {
  callee(event.data)
    .then(result => cb(null, {
      data: result
    }))
    .catch(error => cb(null, {
      componentRejection: error
    }));
}
