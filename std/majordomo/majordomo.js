const StratError = require('./StratError');
const stackTrace = require('stack-trace');
const stdPath = require('path');

module.exports = async function (rawInvoker, myHostName, ignoreFrames = 2) {
  const invoker = composeInvoker(rawInvoker, myHostName);
  const resolver = functionName => {
    const caller = captureCaller(stackTrace.get(), ignoreFrames);
    if (typeof functionName !== 'string'
      || functionName.split('.').length !== 2) {
      throw new Error(`Input to strat must be a string of the form ServiceName.functionName EX: HelloWorld.foo`);
    }
    return async event => {
      const config = await invoker(caller, `${myHostName}.majordomoConfig`);
      const inScope = config.inScope;
      const onHost = config.onHost;
      const targetService = functionName.split('.')[0];
      if (!inScope[targetService]) {
        throw new Error(`${functionName} is undefined.`);
      }
      if (!onHost[targetService]) {
        event = {
          _stratCallee: functionName,
          event: event
        };
      }
      return invoker(caller, functionName, event);
    };
  };

  resolver.dispatch = async rawEvent => {
    const stack = stackTrace.get();
    if (rawEvent === 'Birth') {
      return await doBirth(resolver, myHostName);  
    }
    if (typeof rawEvent === 'object' && typeof rawEvent._stratCallee === 'string') {
      return await resolver(rawEvent._stratCallee)(rawEvent.event);
    }
    const config = await resolver(`${myHostName}.majordomoConfig`)();
    if (config.extern !== undefined) {
      return await resolver(config.extern)(rawEvent);
    }
    throw new Error('Could not dispatch event to a Strat function');
  };

  return resolver;
};

async function doBirth (resolver, myHostName) {
  try {
    const config = await resolver(`${myHostName}.majordomoConfig`)();
    const births = config.birth;
    var birth, i = 0, length = births.length, birthResults = {};
    for(; i<length; i++) {
      birth = births[i];
      birthResults[birth] = await resolver(birth)('Birth');
    }
    return birthResults;
  } catch (e) {
    throw new Error(`Failed to perform Birth events for host ${myHostName}
${e.stack}`);
  }
}

function composeInvoker (rawInvoker, myHostName) {
  return async function compose (caller, target, event) {
    try {
      return await rawInvoker(target, event);
    } catch (e) {
      throw new StratError(caller, e);
    }
  }
}

function captureCaller (stack, ignoreFrames) {
  const relevantStack = stack.slice(ignoreFrames);

  return relevantStack.map(frame => {
    return {
      file: frame.getFileName(),
      functionName: frame.getFunctionName(),
      line: frame.getLineNumber()
    };
  })[0];
};

// function getCaller (stack, services) {
//   const x = stack
//     .map(frame => `${frame.getFunctionName()}: ${frame.getLineNumber()}`);
//   console.log(x);
//   var i = 0, length = stack.length,
//     frame,
//     fnName,
//     fileName,
//     line,
//     fileTokens,
//     service,
//     fnFile
//   for(; i<length; i++) {
//     frame = stack[i];
//     fnName = frame.getFunctionName();
//     fileName = frame.getFileName();
//     fileTokens = fileName.split('/');
//     service = fileTokens[fileTokens.length - 2];
//     fnFile = stdPath.basename(fileTokens[fileTokens.length - 1]);
//     line = frame.getLineNumber();
//     if (services[service]) {
//       if (fnNameRegex.test(fnName)) {
//         return {
//           name: fnName,
//           file: fileName,
//           line: line
//         };
//       }
//       return {
//         name: `${service}.${fnName}`,
//         file: fileName,
//         line: line
//       };
//     }
//   }
//   return null;
// }
