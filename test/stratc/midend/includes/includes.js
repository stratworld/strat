const fileDrivenTests = require('../../../util/fileDrivenTests');
const positiveCases = require('./positiveCases');

describe('includes', () => {
  describe('positive', () => {
    fileDrivenTests(positiveCases, 'includes');
  });
});
