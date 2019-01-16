module.exports = function (targetFunction) {
  return function (arg) {
    //require targetFunction
    //todo: serialize and deserialize it
    return require(`../../../${targetFunction}`)(arg);
  }
};
