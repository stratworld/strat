//TODO: this should be some kind of "super()" call
//TODO: ¿¿¿¿¿ inheritance ?????
//const stdEmitter = require('../baseSource/stdEmitter');
const Strat = require('strat').getResolver();
const reflect = Strat('this.reflect');
const match = Strat('this.match');

const contentTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain'
};

async function emit (event) {
  const referenceTuple = await stdEmit(event);
  const reference = referenceTuple[1];
  const mutatedEvent = referenceTuple[0];
  const referenceTokens = reference.split('.');
  const referenceService = referenceTokens[0];
  const referenceFnName = referenceTokens[1];
  const referenceReflect = Strat(`${referenceService}.reflect`);
  const referenceDeclaration = await referenceReflect();

  const referenceFnDeclaration = referenceDeclaration
    .functions
    .filter(fn => fn.name === referenceFnName)
    [0];

  const media = referenceFnDeclaration.isResource
    ? referenceFnDeclaration.media
    : '.json'

  const headers = {
    'Content-Type': contentTypes[media] || contentTypes['.txt']
  };

  const callResult = await (Strat(reference)(mutatedEvent));
  return {
    body: callResult,
    headers: headers
  };
}

module.exports = async function emitHttpEvent (rawRequest) {
  try {
    return success(await emit(rawRequest));
  } catch (e) {
    if ((e.message || '').indexOf('No match') > -1) {
      return await tryEmitNotFound(e);
    }
    return await tryEmitError(e);
  }
};

function success (emitResponse) {
  return {
    status: 200,
    ...emitResponse
  };
}

function errorContentType () {
  return {
    headers: {
      'Content-Type': 'text/html'
    }
  };
}

async function tryEmitNotFound (e) {
  try {
    const custom404 = await emit({status: 404, error: e});
    return {
      status: 404,
      ...custom404
    };
  } catch (stillNotFound) {
    if (stillNotFound.message.indexOf('No match') > -1) {
      return {
        status: 404,
        body: 'not found',
        ...errorContentType()
      };
    }
    return {
      status: 500,
      body: stillNotFound.stack,
      ...errorContentType()
    };
  }
}

async function tryEmitError (e) {
  try {
    const customError = await emit({status: 500, error: e});
    return {
      status: 500,
      ...customError
    };
  } catch (stillError) {
    return {
      status: 500,
      body: e.stack,
      ...errorContentType()
    };
  }
}





// This is pretty much copy+paste stdEmit.
// Need an interface from stdEmit that you can extend.
// Since you can't reference this function in user code
// this isn't the worst, though once a "super()" construct
// exists, we need to use it here.
async function stdEmit (event) {
  const declaration = await reflect();
  const matches = await Promise.all(declaration.subscribers
    .map(async subscriber => [await match({
      //matchers mutate the event!  This is unsafe to do in parallel!
      //todo: pick a solution:
      // 1) deep copy the event for each matcher
      // 2) change the API to not have matchers mutate the event
      // 3) expect matchers to deep copy if they return a new event
      event: event,
      pattern: subscriber.pattern
    }), subscriber.reference]));
  const matchAndReferenceTuples = matches
    .filter(resultTuple => resultTuple[0].matched)
    .map(resultTuple => [resultTuple[0].event, resultTuple[1]]);


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
  return matchAndReferenceTuples[0];

}
