const assert = require('assert');
const hoster = require('./domoHoster');

describe('majordomo', () => {
  it('should depend on majordomoConfig', async () => {
    const host = await hoster({}, 'test');
    try {
      await host.dispatch('Birth');  
      throw new Error('domo didnt try to get config!');
    } catch (e) {}
  });
  it('should load majordomoConfig', async () => {
    var called = false;
    const host = await hoster({
      'test.majordomoConfig': () => {
        called = true;
        return {
          birth: [],
          inScope: {test: true},
          onHost: {test: true}
        };
      }
    }, 'test');

    await host.dispatch('Birth');
    assert(called);
  });
  it('should resolve function names', async () => {
    const host = await hoster({
      'test.majordomoConfig': () => {
        return {
          birth: ['test.foo'],
          inScope: {test: true},
          onHost: {test: true}
        };
      },
      'test.foo': () => {
        const Strat = require('strat');
        const x = Strat('test.x');
        return x();
      },
      'test.x': () => 'x called'
    }, 'test');

    const r = await host.dispatch('Birth');
    assert.deepStrictEqual(r, {'test.foo':'x called'});
  });
  describe('resolution', () => {
    it('should check scope', async () => {
      const host = await hoster({
        'test.majordomoConfig': () => {
          return {
            birth: ['test.foo'],
            inScope: {test: true},
            onHost: {test: true}
          };
        },
        'test.foo': () => {
          const Strat = require('strat');
          const x = Strat('NotInScope.x');
          return x();
        },
        'test.x': () => 'x called'
      }, 'test');

      try {
        await host.dispatch('Birth');
        assert(false);
      } catch (e) {
        assert(e.message.indexOf('NotInScope.x is undefined') > 0)
      }
    });
    [
      undefined,
      null,
      NaN,
      {},
      [],
      () => undefined,
      'notenoughinfo'
    ].forEach(testCase => {
      it(`should provide errors if args are wrong(${testCase})`,
        async () => {
          const host = await hoster({
            'test.majordomoConfig': () => {
              return {
                birth: ['test.foo'],
                inScope: {test: true},
                onHost: {test: true}
              };
            },
            'test.foo': () => {
              const Strat = require('strat');
              const x = Strat(testCase);
              return x();
            }
          }, 'test');

          try {
            await host.dispatch('Birth');
            assert(false);
          } catch (e) {
            assert(e.message.indexOf('Input to strat must be a string') > 0);
          }
        });
    });
  });
  describe('wrapping', () => {
    it('should wrap domo-domo communication', async () => {
      var event;
      const host = await hoster({
        'test.majordomoConfig': () => {
          return {
            birth: ['test.foo'],
            inScope: {test: true, AnotherHost: true},
            onHost: {test: true}
          };
        },
        'test.foo': () => {
          const Strat = require('strat');
          const x = Strat('AnotherHost.x');
          return x('foo');
        },
        //normally AnotherHost will have a domo in front of it
        //to unwrap the event, but because of the mock it gets
        //the raw event
        'AnotherHost.x': e => {
          event = e;
          return true;
        }
      }, 'test');

      await host.dispatch('Birth');
      assert(event._stratCallee === 'AnotherHost.x');
    });
    it('should not wrap extern events', async () => {
      var event;
      const host = await hoster({
        'test.majordomoConfig': () => {
          return {
            birth: ['test.foo'],
            extern: 'test.reception',
            inScope: {test: true},
            onHost: {test: true}
          };
        },
        'test.reception': e => {
          event = e;
          return true;
        }
      }, 'test');

      await host.dispatch('something');
      assert(event === 'something');
    });
    it('should unwrap domo-domo communication', async () => {
      var event;
      const host = await hoster({
        'test.majordomoConfig': () => {
          return {
            birth: ['test.foo'],
            extern: 'test.x',
            inScope: {test: true},
            onHost: {test: true}
          };
        },
        'test.x': e => {
          event = e;
          return true;
        }
      }, 'test');

      await host.dispatch({_stratCallee: 'test.x', event: 'foo'});
      assert(event === 'foo');
    });
    it ('should throw if no extern and no stratCallee', async () => {
      const host = await hoster({
        'test.majordomoConfig': () => {
          return {
            birth: ['test.foo'],
            inScope: {test: true},
            onHost: {test: true}
          };
        }
      }, 'test');

      try {
        await host.dispatch('foobar');
        assert(false);
      } catch (e) {
        assert(e.message.indexOf('Could not dispatch event to a Strat function') > -1);
      }
    });
  });
  describe.only('traces', () => {
    it('should provide a system stack trace if a component fails', async () => {
      const host = await hoster({
        'test.majordomoConfig': () => {
          return {
            birth: ['test.foo'],
            extern: 'test.x',
            inScope: {test: true},
            onHost: {test: true}
          };
        },
        'test.x': e => {
          const Strat = require('strat');
          return Strat('test.y')(e);
        },
        'test.y': e => {
          const Strat = require('strat');
          return Strat('test.z')(e);
        },
        'test.z': e => {
          throw new Error('New error from z');
        },
      }, 'test');

      try {
        const result = await host.dispatch('foo');  
      } catch (e) {
        console.log(e.serialize());
      }
    });
  });
});
