module.exports = function (targetFunction) {
  return function (arg) {
    // console.log(arg)
    //todo: serialize and deserialize it
    return require(`../../../${targetFunction}`)(arg);
  }
};
