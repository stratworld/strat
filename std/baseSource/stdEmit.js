const Strat = require('strat');
const reflect = Strat('this.reflect');
const match = Strat('this.match');

module.exports = async event => {
  const declaration = await reflect();

  const resultAndReferenceTuples = declaration.subscribers
    .map(async subscriber => [await match({
      event: event,
      pattern: subscriber.pattern
    }), subscriber.reference])
    .filter(resultTuple => result[0].matched)
    .map(resultTuple => [resultTuple[0].event, resultTuple[1]]);

  if (declaration.isAsync) {
    Promise.all(resultAndDestinationTuples
      .map(tuple => {
        return Strat(resultAndDestinationTuples[1])
          (resultAndDestinationTuples[0]);
      }));
  } else {
    if (resultAndDestinationTuples.length > 1) {
      throw `Too many matches for ${declaration.name} event
  ${JSON.stringify(event, null, 2)}
  Matched with
    ${resultAndDestinationTuples.map(t => t[1]).join(',\n    ')}`;
    }
    if (resultAndDestinationTuples.length === 0) {
      throw `No match for ${declaration.name} event
  ${JSON.stringify(event, null, 2)}`;
    }
    const firstMatch = resultAndDestinationTuples[0];
    return Strat(firstMatch[1])(firstMatch[0]);
  }
};
