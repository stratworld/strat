const compile = require('../../../../language/compiler').runSegment;
const negativeCases = require('./negativeCases');
const positiveCases = require('./positiveCases');

describe('names', () => {
  describe('negative', () => {
    negativeCases.forEach(negativeCase => {
      it(`should throw error code ${negativeCase.code}`, done => {
        compile(
          null,
          'names',
          Buffer.from(negativeCase.source),
          negativeCase.filename)
          .then(() => done(new Error(`The following source code didn't throw ${negativeCase.code}:

${negativeCase.source}`)))
          .catch(e => {
            if (e.errorCode === negativeCase.code) {
              done();
            } else {
              done(new Error(`The following source code didn't throw the correct error code
  expected ${negativeCase.code} got ${e.errorCode}

${negativeCase.source}`));
            }
          });
      });
    });
  });

  // describe('positive', () => {

  // });
});
