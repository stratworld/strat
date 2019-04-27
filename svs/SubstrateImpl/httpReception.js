const Strat = require('strat').getResolver();
const emit = Strat('this.emit');

module.exports = async function formatHttpEvent (rawRequest) {
  try {
    return success(await emit(rawRequest));
  } catch (e) {
    if (e.message.indexOf('No match') > -1) {
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
