module.exports = async function (invoker, myHostName) {
  const resolver = functionName => {
    //todo: check scope
    //todo: wrap
    return e => invoker(functionName, e);
  };

  resolver.dispatch = async rawEvent => {
    if (rawEvent === 'Birth') {
      await doBirth(invoker, myHostName);
    }
  };

  return resolver;
};

async function doBirth (invoker, myHostName) {
  const config = await invoker(`${myHostName}.majordomoConfig`);
  const births = config.birth;
  var birth, i = 0, length = births.length, birthResult;
  for(; i<length; i++) {
    birth = births[i];
    try {
      birthResult = await invoker(birth, 'Birth');
      console.log(JSON.stringify(birthResult, null, 2));
    } catch (e) {
      console.log(e.stack);
    }
  }
}
