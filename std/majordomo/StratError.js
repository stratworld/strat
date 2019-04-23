class StratError extends Error {
  constructor(calleeInformation, previous) {
    super();
    Error.captureStackTrace(this, StratError);
    this.name = 'StratError';
    this.previous = previous;
    this.calleeInformation = calleeInformation;
    this.stack = this.serialize();
    this.message = previous.message;
  }

  serialize() {
    const stack = [];
    var focus = this, previous;
    while(focus instanceof StratError) {
      stack.unshift(focus);
      previous = focus.previous;
      focus.previous;
      focus = previous;
    }
    stack.unshift(focus);
    return stack.map(sysFrame => {
      if (sysFrame instanceof StratError) {
        return serializeFrame(sysFrame.calleeInformation)
      }
      if (sysFrame instanceof Error) {
        return sysFrame.stack;
      }
      return sysFrame;
    }).join('\n  ');
  }
}

function serializeFrame (ci) {
  if (ci === undefined) {
    return '';
  }
  return `Called by ${ci.functionName} (${ci.file}:${ci.line}:${ci.col})`;
}

module.exports = StratError;