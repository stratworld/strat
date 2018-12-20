const AST = require("../../ast").build;

module.exports = function (T, error, descend) {
  return {
    file: () => {
      return AST('file', {}, descend('declaration'));
    },
    declaration: () => {
      if (T.match('SOURCE')) {
        return descend('source');
      }
      T.consume('SERVICE');
      return descend('service');
    },
    source: () => {
      const name = T.consume('IDENTIFIER');
      const block = descend('block');
      return AST('source', {
        name: name
      }, block);
    },
    service: () => {
      const name = T.consume('IDENTIFIER');
      T.consume('LEFT_BRACE');
      const components = [];
      const kvps = [];
      const includes = [];
      while (T.peek().type !== 'RIGHT_BRACE'
        && T.peek().type !== 'END') {
        if (T.match('INCLUDE')) {
          includes.push(descend('include'));
        } else if (T.peek().type === 'IDENTIFIER' && T.peek2().type === 'COLON') {
          kvps.push(descend('kvp'));
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
        eventAst = descend('eventDispatch');
      }
      const componentAst = descend('function');
      return eventAst === undefined
        ? componentAst
        : AST('dispatch', {}, [componentAst], [eventAst]);
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
    eventDispatch: () => {
      const name = T.consume('IDENTIFIER');
      const block = descend('block');
      T.consume('ARROW');
      return AST('event', {
        name: name
      }, block);
    },
    function: () => {
      if (T.peek2().type === 'PERIOD') {
        const otherService = T.consume('IDENTIFIER');
        T.consume('PERIOD');
        const otherFunction = T.consume('IDENTIFIER');
        return AST('reference', {
          service: otherService,
          function: otherFunction
        });
      }
      const otuputShape = descend('shape');
      const name = T.consume('IDENTIFIER');
      var inputShape;
      T.consume('LEFT_PAREN');
      if (T.peek().type === 'IDENTIFIER') {
        inputShape = descend('shape');  
      }
      T.consume('RIGHT_PAREN');
      const block = descend('block');
      return AST('function', {
        name: name,
        // todo: we lose which shape was input/output.
        // Right now, this doesn't matter and the AST doesn't
        // have a great vehicle to save this.
      }, block, inputShape, otuputShape);
    },
    shape: () => {
      const name = T.consume('IDENTIFIER');
      return AST('shape', {
        name: name
      });
    }
  }
}