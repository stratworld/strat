const builder = require('../../../stdSources/Http/builder');

describe('Http builder', () => {
  it('should build', () => {
    builder([{
      foo: 'bar'
    }]);
  });
});
