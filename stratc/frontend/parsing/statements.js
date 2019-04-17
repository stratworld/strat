const AST = require("../../ast").build;

module.exports = function (T, error, descend) {
  return {
    file: () => {
      const children = {
        source: [],
        service: []
      };
      while(!T.atEnd()) {
        const next = T.match('SERVICE')
          ? 'service'
          : 'source';
        children[next].push(descend(next));
      }
      return AST('file', {}, children.source, children.service);
    },
    source: () => {
      const sync = !T.match('ASYNC');
      T.consume('SOURCE');
      const name = T.consume('IDENTIFIER');
      const body = descend('body');
      return AST('source', {
        name: name,
        sync: sync
      }, body);
    },
    service: () => {
      const name = T.consume('IDENTIFIER');
      const body = descend('body');
      return AST('service', {
        name: name
      }, body);
    },
    body: () => {
      T.consume('LEFT_BRACE');
      const components = [];
      const includes = [];
      while (T.peek().type !== 'RIGHT_BRACE'
        && T.peek().type !== 'END') {
        if (T.match('INCLUDE')) {
          includes.push(descend('include'));
        } else {
          components.push(descend('component'))
        }
      }
      T.consume('RIGHT_BRACE');
      return AST('body', {}, includes, components);
    },
    include: () => {
      return AST('include', {
        artifact: T.consume('STRING')
      });
    },
    component: () => {
      if (T.peek().type === 'IDENTIFIER' && T.peek2().type === 'LEFT_PAREN') {
        return descend('function');
      }
      return descend('dispatch');
    },
    dispatch: () => {
      const events = [];
      var functionName;
      while(!T.match('ARROW')) {
        events.push(descend('event'));
      }
      if (T.peek().type === 'IDENTIFIER'
          && T.peek2().type === 'PERIOD') {
        return AST('dispatch', {}, events, descend('reference'));
      } else if (T.peek().type === 'IDENTIFIER') {
        functionName = descend('functionName');
      }
      const artifact = T.consume('STRING');
      return AST('dispatch', {
        artifact: artifact
      }, events, functionName);
    },
    reference: () => {
      const service = T.consume('IDENTIFIER');
      T.consume('PERIOD');
      const fn = T.consume('IDENTIFIER');
      return AST('reference', {
        service: service,
        function: fn
      });
    },
    event: () => {
      const name = T.consume('IDENTIFIER');
      if (T.peek().type === 'IDENTIFIER'
          || T.peek().type === 'ARROW') {
        return AST('event', {
          name: name
        });
      }
      const pattern = descend('pattern');
      return AST('event', {
        name: name
      }, pattern);
    },
    function: () => {
      const functionName = descend('functionName');
      const artifact = T.consume('STRING');
      return AST('function', {
        artifact: artifact
      }, functionName);
    },
    functionName: () => {
      const name = T.consume('IDENTIFIER');
      var signature;
      if (T.peek().type !== 'ARROW') {
        signature = descend('signature');
      }
      T.consume('ARROW');
      return AST('functionName', {
        name: name
      }, signature);
    },
    signature: () => {
      T.consume('LEFT_PAREN');
      var inputShape;
      if (T.peek().type !== 'RIGHT_PAREN') {
        inputShape = descend('shape');
      }
      T.consume('RIGHT_PAREN');
      T.consume('COLON');
      const outputShape = descend('shape');
      return AST('signature', {}, outputShape, inputShape);
    },
    pattern: () => {
      const nextType = T.peek().type;
      switch (nextType) {
        case 'NUMBER':
          return AST('pattern', {
            type: 'number',
            value: parseFloat(T.consume('NUMBER'))
          });
        case 'STRING':
          return AST('pattern', {
            type: 'string',
            value: T.consume('STRING')
          });
        case 'LEFT_BRACE':
          return descend('map');
        case 'LEFT_BRACKET':
          return descend('array');
        case 'TRUE':
          T.advance();
          return AST('pattern', {
            type: 'boolean',
            value: true
          });
        case 'FALSE':
          T.advance();
          return AST('pattern', {
            type: 'boolean',
            value: false
          });
        case 'NULL':
          T.advance();
          return AST('pattern', {
            type: 'null',
            value: null
          });
      }
      throw {
        stratCode: "E_UNEXPECTED_TOKEN",
        message: `Unexpected token ${T.peek().value}
  Expected 'true', 'false', 'null', number, string, map, or array.`,
        line: T.peek().line
      };
    },
    map: () => {
      T.consume('LEFT_BRACE');
      const kvps = [];
      while(!T.match('RIGHT_BRACE')) {
        kvps.push(descend('kvp'));
      }
      return AST('pattern', {
        type: 'map'
      }, kvps);
    },
    kvp: () => {
      const key = T.consume('IDENTIFIER');
      T.consume('COLON');
      const value = descend('pattern');
      return AST('pattern', {
        key: key
      }, value);
    },
    array: () => {
      T.consume('LEFT_BRACKET');
      const shape = descend('shape');
      T.consume('RIGHT_BRACKET');
      return AST('array', {
        type: 'array'
      }, shape);
    },
    shape: () => {
      const name = T.consume('IDENTIFIER');
      return AST('shape', {
        name: name
      });
    }
  }
}
