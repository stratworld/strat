module.exports = {
  handler: function (event, context, cb) {
    require('lit')((event || {})._litCallee)(event)
      .then(result => cb(null, result))
      .catch(error => cb(error));
  }
};
