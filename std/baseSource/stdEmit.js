const Strat = require('strat');
const getConfig = Strat('this.config');
const match = Strat('this.match');

module.exports = async event => {
  const config = await getConfig();

  const resultAndDestinationTuples = patterns
    .map(async pattern => [await match({
      event: event,
      pattern: pattern.pattern
    }), pattern.destination])
    .filter(resultTuple => result[0].matched)
    .map(resultTuple => [resultTuple[0].event, resultTuple[1]]);

  if (config.async) {
    Promise.all(resultAndDestinationTuples
      .map(tuple => {
        return Strat(resultAndDestinationTuples[1])
          (resultAndDestinationTuples[0]);
      }));
  } else {
    if (resultAndDestinationTuples.length > 1) {
      throw `Too many matches for ${config.name} event
  ${JSON.stringify(event, null, 2)}
  Matched with
    ${resultAndDestinationTuples.map(t => t[1]).join(',\n    ')}`;
    }
    if (resultAndDestinationTuples.length === 0) {
      throw `No match for ${config.name} event
  ${JSON.stringify(event, null, 2)}`;
    }
    const firstMatch = resultAndDestinationTuples[0];
    return Strat(firstMatch[1])(firstMatch[0]);
  }
};
