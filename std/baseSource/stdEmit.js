const Strat = require('strat');
const reflect = Strat('this.reflect');
const match = Strat('this.match');

module.exports = async event => {
  const declaration = await reflect();
  const matches = await Promise.all(declaration.subscribers
    .map(async subscriber => [await match({
      event: event,
      pattern: subscriber.pattern
    }), subscriber.reference]));
  const matchAndReferenceTuples = matches
    .filter(resultTuple => resultTuple[0].matched)
    .map(resultTuple => [resultTuple[0].event, resultTuple[1]]);

  if (declaration.isAsync) {
    Promise.all(matchAndReferenceTuples
      .map(tuple => {
        return Strat(tuple[1])
          (tuple[0]);
      }));
  } else {
    if (matchAndReferenceTuples.length > 1) {
      throw new Error(`Too many matches for ${declaration.name} event
  ${JSON.stringify(event, null, 2)}
  Matched with
    ${matchAndReferenceTuples.map(t => t[1]).join(',\n    ')}`);
    }
    if (matchAndReferenceTuples.length === 0) {
      throw new Error(`No match for ${declaration.name} event
  ${JSON.stringify(event, null, 2)}`);
    }
    const firstMatch = matchAndReferenceTuples[0];
    return Strat(firstMatch[1])(firstMatch[0]);
  }
};
