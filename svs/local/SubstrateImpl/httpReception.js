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

function success (body) {
  return {
    status: 200,
    body: body
  };
}

async function tryEmitNotFound (e) {
  try {
    return success(await emit({status: 404, error: e}));
  } catch (stillNotFound) {
    if (stillNotFound.message.indexOf('No match') > -1) {
      return {
        status: 404,
        body: 'not found'
      };
    }
    return {
      status: 500,
      body: stillNotFound.stack
    };
  }
}

async function tryEmitError (e) {
  try {
    return success(await emit({status: 500, error: e}));
  } catch (stillError) {
    return {
      status: 500,
      body: e.stack
    };
  }
}
