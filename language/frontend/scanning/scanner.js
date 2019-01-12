const Tokens = require('./tokens');
const tokenRadix = Tokens.radix;
const ignoreTokens = Tokens.ignoreTokens;
const numberRegex = /^[0-9]+(\.[0-9]*)?$/g;
const identifierRegex = /^[a-zA-Z_]+$/g;

function scan (input, filename) {
  var tokens = [], index = 0, token, newLines = 0;
  const inputString = input.toString();
  while(index < inputString.length) {
    token = chunk(index, inputString);
    if (token.type === 'NEWLINE' || token.type === 'COMMENT') newLines++;
    if (token.type === 'STRING') newLines += countNewLines(token.value);
    token.line = newLines + 1;
    tokens.push(token);
    index += token.length;
  }

  tokens = tokens.filter(token => !ignoreTokens[token.type]);
  tokens.push({
    type: 'END',
    line: newLines + 1,
    valid: true
  });
  checkTokens(tokens, filename);
  return {
    tokens: cleanTokens(tokens),
    path: filename
  };
}

function cleanTokens (tokens) {
  return tokens.map(token => {
    return {
      value: token.value,
      line: token.line,
      type: token.type
    }
  });
}

function checkTokens (tokens, filename) {
  const errorTokens = (tokens || [])
    .filter(token => token.valid === false)

  if (errorTokens.length > 0) {
    //todo: make a vehicle for these
    throw {
      error: 'Invalid tokens',
      filename: filename,
      tokens: errorTokens
    };
  }
}

function countNewLines (string) {
  var count = 0;
  var pos = string.indexOf('\n');
  while (pos !== -1) {
    count++;
    pos = string.indexOf('\n', pos + 1);
  }

  return count;
}

//given a string, say 
// A: if its valid
// B: if there's more in the radix
//       valid    not valid
//   more 'more'    'more'
//no more object    false
function radixHas (input) {
  if (input[0] === '"') {
    if (input.length > 1
      && input[input.length - 1] === '"'
      && input[input.length - 2] !== '\\') {
      return {
        value: input
          .substr(1, input.length - 2)
          .replace('\\"', '"'),
        valid: true,
        type: 'STRING',
        stop: true,
        length: input.length
      };
    }
    return 'more';
  }

  if (input[0] === '/' && input[1] === '/') {
    if (input[input.length - 1] === '\n'
      || input[input.length - 1] === '\0') {
      return {
        value: '',
        type: 'COMMENT',
        valid: true,
        stop: true,
        length: input.length
      }
    }
    return 'more';
  }

  if (input.match(numberRegex)) return {
    valid: true,
    type: 'NUMBER',
    value: Number.parseFloat(input),
    length: input.length
  };

  if (input === 'true' || input === 'false') return {
    valid: true,
    type: 'BOOLEAN',
    value: input === 'true' ? true : false,
    length: input.length
  };

  var focus = tokenRadix;
  for (var i = 0; i < input.length; i++) {
    if (focus[input[i]] !== undefined) {
      focus = focus[input[i]];
    } else {
      if (input.match(identifierRegex)) return {
        valid: true,
        type: 'IDENTIFIER',
        value: input,
        length: input.length
      }
      return false;
    }
  }
  return focus.valid ? {
    type: focus.type,
    valid: true,
    value: input,
    length: input.length
  } : 'more';
}

function chunk (start, input) {
  var str = input[start], has, ret = {
    value: str,
    valid: false,
    length: 1
  };
  while(start <= input.length) {
    has = radixHas(start == input.length ? str + '\0' : str);
    if (has === false) {
      return ret;
    }
    if (typeof has === 'object') {
      ret = has;
    }
    if (has.stop) return ret;
    str += input[++start];
  }
  return ret;
}

module.exports = scan;
