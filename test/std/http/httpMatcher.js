const matcher = require('../../../std/Http/httpMatcher');
const cases = require('./matcherCases');
const assert = require('assert');

describe('httpMatcher', () => {
  cases.forEach(tc => {
    it(`should match ${tc.name}`, async () => {
      const match = matcher({
        event: tc.event,
        pattern: tc.pattern
      });
      if (tc.params) {
        assert.deepStrictEqual(match.event.params, tc.params);  
      }
      assert(match.matched === tc.matched);
    });
  });
});
