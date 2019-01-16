module.exports = function (event, context, cb) {
  const Lit = require('lit');
  Lit(event._litCallee)(event.data)
    .then(result => cb(null, {
      data: result
    }))
    .catch(error => cb(null, {
      componentRejection: error
    }));
}