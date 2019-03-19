module.exports = {
  handler: function (event, context, cb) {
    const callee = (event || {})._stratCallee;
    require('strat')(callee)(event)
      .then(result => {
        if (callee === undefined) {
          cb(null, result)
        } else {
          cb(null, {
            data: result
          });
        }
      })
      .catch(error => cb(error));
  }
};
