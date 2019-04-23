class StratError extends Error {
  constructor(calleeInformation, previous, params) {
    super();
    Error.captureStackTrace(this, StratError);
    this.name = 'StratError';
    this.previous = previous;
    this.calleeInformation = calleeInformation;
  }
  //todo: override toString and stack

  serialize() {
    const stack = [];
    var focus = this, previous;
    while(focus instanceof StratError) {
      stack.unshift(focus);
      previous = focus.previous;
      delete focus.previous;
      focus = previous;

    }
    stack.unshift(focus);
    return stack;
  }
}

module.exports = StratError;