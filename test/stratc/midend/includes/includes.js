const fileDrivenTests = require('../../../util/fileDrivenTests');
const positiveCases = require('./positiveCases');

describe('includes', () => {
  describe.only('positive', () => {
    fileDrivenTests(positiveCases, 'includes');
  });
});
