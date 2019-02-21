const AST = require("../../ast").build;

module.exports = function (T, error, descend) {
  return {
    file: () => {
      const next = T.match('SOURCE')
        ? 'source'
        : 'service';
      return AST('file', {}, descend(next));
    },
    source: () => {
      const name = T.consume('IDENTIFIER');
      const block = descend('block');
      return AST('source', {
        name: name
      }, block);
    },
    service: () => {
      T.consume('SERVICE');
      const name = T.consume('IDENTIFIER');
      T.consume('LEFT_BRACE');
      const components = [];
      const kvps = [];
      const includes = [];
      while (T.peek().type !== 'RIGHT_BRACE'
        && T.peek().type !== 'END') {
        if (T.match('INCLUDE')) {
          includes.push(descend('include'));
        } else {
          components.push(descend('component'))
        }
      }
      T.advance();
      return AST('service', {
        name: name
      }, kvps, includes, components);
    },
    include: () => {
      return AST('include', {
        path: T.consume('STRING')
      });
    },
    component: () => {
      var eventAst;
      if (T.peek().type === 'IDENTIFIER' && T.peek2().type === 'LEFT_BRACE') {
        return descend('dispatch');
      }
      return descend('function');
    },
    block: () => {
      T.consume('LEFT_BRACE');
      const kvps = [];
      while(!T.match('RIGHT_BRACE')) {
        kvps.push(descend('kvp'));
      }
      return kvps;
    },
    kvp: () => {
      const key = T.consume('IDENTIFIER');
      T.consume('COLON');
      const value = T.consume('STRING');
      return AST('kvp', {
        key: key,
        value: value
      });
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
      } else if (T.peek().type === 'IDENTIFIER'
        || T.peek().type === 'PUBLIC') {
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
      const block = descend('block');
      return AST('event', {
        name: name
      }, block);
    },
    function: () => {
      const functionName = descend('functionName');
      const artifact = T.consume('STRING');
      return AST('function', {
        artifact: artifact
      }, functionName);
    },
    functionName: () => {
      const public = T.match('PUBLIC');
      const name = T.consume('IDENTIFIER');
      var signature;
      if (T.peek().type !== 'ARROW') {
        signature = descend('signature');
      }
      T.consume('ARROW');
      return AST('functionName', {
        name: name,
        public: public || undefined
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
    shape: () => {
      const name = T.consume('IDENTIFIER');
      return AST('shape', {
        name: name
      });
    }
  }
}