const mockRuntime = require('../../mocks/mockRuntime');
const path = require('path');
const assert = require('assert');
const match = mockRuntime({
  scriptPath: path.resolve(__dirname, '../../../std/baseSource/stdMatch.js')
});
const cases = require('./matchCases');

describe('stdMatch', () => {
  describe('match cases', () => {
    cases.forEach(testCase => {
      it(`should match ${testCase.name}`, async () => {
        const result = await match({
          event: testCase.event,
          pattern: testCase.pattern
        }).matched;
        assert(result === testCase.matched);
      });
    });  
  });
});
