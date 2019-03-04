module.exports = {
  handler: function (event, context, cb) {
    require('strat')((event || {})._stratCallee)(event)
      .then(result => cb(null, result))
      .catch(error => cb(error));
  }
};
