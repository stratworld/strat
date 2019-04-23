const StratError = require('./StratError');
const stackTrace = require('stack-trace');
const stdPath = require('path');

module.exports = async function (rawInvoker, myHostName, ignoreFrames = 2) {
  const invoker = composeInvoker(rawInvoker, myHostName);
  const Majordomo = functionName => {
    const caller = captureCaller(stackTrace.get(), ignoreFrames);
    if (typeof functionName !== 'string'
      || functionName.split('.').length !== 2) {
      throw new StratError(caller, new Error(`Input to strat must be a string of the form ServiceName.functionName EX: HelloWorld.foo`));
    }
    return async event => {
      const caller = captureCaller(stackTrace.get(), ignoreFrames - 1);
      const config = await invoker(caller, `${myHostName}.majordomoConfig`);
      const inScope = config.inScope;
      const onHost = config.onHost;
      const targetService = functionName.split('.')[0];
      if (!inScope[targetService]) {
        throw new StratError(caller, new Error(`${functionName} is undefined.`));
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

  Majordomo.dispatch = async rawEvent => {
    const caller = captureCaller(stackTrace.get(), ignoreFrames - 1);
    if (rawEvent === 'Birth') {
      try {
        const config = await Majordomo(`${myHostName}.majordomoConfig`)();
        const births = config.birth;
        var birth, i = 0, length = births.length, birthResults = {};
        for(; i<length; i++) {
          birth = births[i];
          birthResults[birth] = await Majordomo(birth)('Birth');
        }
        return birthResults;
      } catch (e) {
        throw new StratError(caller, e);
      }
    }
    if (typeof rawEvent === 'object' && typeof rawEvent._stratCallee === 'string') {
      return await Majordomo(rawEvent._stratCallee)(rawEvent.event);
    }
    const config = await Majordomo(`${myHostName}.majordomoConfig`)();
    if (config.extern !== undefined) {
      return await Majordomo(config.extern)(rawEvent);
    }
    throw new StratError(caller, new Error('Could not dispatch event to a Strat function'));
  };

  return Majordomo;
};

function composeInvoker (rawInvoker, myHostName) {
  return async function compose (caller, callee, event) {
    try {
      return await rawInvoker(callee, event);
    } catch (e) {
      throw new StratError(caller, e);
    }
  }
}

function captureCaller (stack, ignoreFrames) {
  let relevantStack = stack.slice(ignoreFrames);
  if (relevantStack.length === 0) {
    relevantStack = stack.slice(ignoreFrames - 1);
  }

  return relevantStack.map(frame => {
    return {
      file: frame.getFileName(),
      functionName: frame.getFunctionName(),
      line: frame.getLineNumber(),
      col: frame.getColumnNumber(),
      frame: frame
    };
  })[0];
};
