const assert = require('assert');
const hoster = require('../majordomo/domoHoster');
const stdPath = require('path');
const StratError = require('../../../std/majordomo/StratError');
const birth = {
  _stratEvent: 'Birth',
  event: 'Birth'
};

async function getRuntime (stuff, subs, async) {
  return (await hoster(Object.assign({
    'test.majordomoConfig': () => {
      return {
        birth: ['test.entry'],
        inScope: {test: true, baseSource: true},
        onHost: {test: true, baseSource: true}
      };
    },
    'test.proxy': e => e,
    'baseSource.match': stdPath.resolve(__dirname, '../../../std/baseSource/stdMatch'),
    'baseSource.emit': stdPath.resolve(__dirname, '../../../std/baseSource/stdEmit'),
    'baseSource.reflect': () => {
      return {
        isAsync: async || false,
        name: 'test',
        declaredFile: 'foo.js',
        subscribers: subs !== undefined ? subs : [],
        functions: []
      }
    }
  }, stuff), 'test')).dispatch;
}

describe('stdEmit', () => {
  it('should emit to an any pattern', async () => {
    const d = await getRuntime({
      'test.entry': () => {
        const Strat = require('strat').getResolver();
        const emit = Strat('this.emit');
        return emit('foo');
      },
      'test.got': e => 'my result'
    }, [{ pattern: 'any', reference: 'test.got'}]);
    
    const x = await d(birth);
    assert.deepStrictEqual(x, {'test.entry': 'my result'});
  });
  it('should throw if no match is found', async () => {
    const d = await getRuntime({
      'test.entry': async () => {
        const Strat = require('strat').getResolver();
        const emit = Strat('this.emit');
        return await emit('y');
      },
      'test.got': e => 'not supposed to happen'
    }, [{ pattern: 'x', reference: 'test.got'}]);
    
    try {
      await d(birth);
      assert(false);
    } catch (e) {
      assert(e instanceof StratError);
      assert(e.message.indexOf('No match') > -1);
    }
  });
  it('should throw if multiple sync matches found', async () => {
    const d = await getRuntime({
      'test.entry': async () => {
        const Strat = require('strat').getResolver();
        const emit = Strat('this.emit');
        return await emit('x');
      },
      'test.got': e => 'not supposed to happen'
    }, [{ pattern: 'x', reference: 'test.got'},{ pattern: 'any', reference: 'test.got'} ]);
    
    try {
      await d(birth);
      assert(false);
    } catch (e) {
      assert(e instanceof StratError);
      assert(e.message.indexOf('Too many') > -1);
    }
  });
  it('should match to multiple subs async', async () => {
    var counter = 0;
    const d = await getRuntime({
      'test.entry': async () => {
        const Strat = require('strat').getResolver();
        const emit = Strat('this.emit');
        return await emit('x');
      },
      'test.got': e => {
        counter++;
      }
    }, [
      { pattern: 'x', reference: 'test.got'},
      { pattern: 'any', reference: 'test.got'}
    ], true);
    
    await d(birth);
    assert(counter === 2);
  });
  it('should pass a mutated event', async () => {
    const d = await getRuntime({
      'test.entry': async () => {
        const Strat = require('strat').getResolver();
        const emit = Strat('this.emit');
        return await emit('x');
      },
      'test.got': e => e,
      'baseSource.match': e => {
        return { matched: true, event: 'mutated' }
      }
    }, [{ pattern: 'x', reference: 'test.got'}]);
    
    const result = await d(birth);
    assert.deepStrictEqual(result, {'test.entry':'mutated'});
  });
});
