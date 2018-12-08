const TokenTypes = {
  LEFT_PAREN: sequence('('),
  RIGHT_PAREN: sequence(')'),
  LEFT_BRACE: sequence('{'),
  RIGHT_BRACE: sequence('}'),
  LEFT_BRACKET: sequence('['),
  RIGHT_BRACKET: sequence(']'),
  COMMA: sequence(','),
  PERIOD: sequence('.'),
  SEMI: sequence(';'),
  SLASH: sequence('/'),
  COLON: sequence(':'),
  ARROW: sequence('->'),

  //whitespace
  SPACE: sequence(' '),
  TAB: sequence(' '),
  NEWLINE: sequence('\n'),
  END: sequence('\0'),

  //keywords
  SERVICE: sequence('service'),
  SOURCE: sequence('source'),
  INCLUDE: sequence('include')
}

function sequence (string) {
  return {
    sequence: string.split('')
  };
}

function getName (type) {
  return TokenTypes[type] === undefined
    ? type
    : TokenTypes[type].sequence.join('');
}

//its a trie not a radix
//radix is way more fun to say tho
function buildRadix() {
  const radix = {};
  var focus, i , char, tokenType;
  Object.keys(TokenTypes)
  .map(key => [key, TokenTypes[key]])
  .forEach(kvp => {
    focus = radix;
    i = 0;
    tokenType = kvp[1]
    for(;i < tokenType.sequence.length; i++) {
      char = tokenType.sequence[i];
      if (!focus[char]) {
        focus[char] = {};
      }
      focus = focus[char];
    }
    focus.valid = true;
    focus.type = kvp[0];
  });
  return radix;
}

module.exports = {
  radix: buildRadix(),
  getName: getName,
  ignoreTokens: {
    'SPACE': true,
    'TAB': true,
    'NEWLINE': true,
    'COMMENT': true,
    'COMMA': true
  }
};
