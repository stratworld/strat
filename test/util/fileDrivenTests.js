const fsFactory = require('../mocks/mockFileSystem');
const compileFactory = require('../language/compile');

module.exports = function (cases, stop) {
  cases.forEach(testCase => {
    it(testCase.name, done => {
      const fs = fsFactory(testCase.files);
      const compile = compileFactory({ fs: fs });
      compile(
        null,
        stop,
        fs.cat(testCase.entry),
        testCase.entry)
        .then(() => {
          if (testCase.errorCode !== undefined) {
            done(new Error(`${testCase.name} didn't throw ${testCase.errorCode} when an error was expected.`));
          } else {
            done();
          }
        })
        .catch(e => {
          if (testCase.errorCode !== undefined) {
            if (testCase.errorCode === e.errorCode) {
              done();
            } else {
              done(new Error(`${testCase.name} didn't throw the correct error code
  expected ${testCase.errorCode} got ${e.errorCode}.  Error:

${JSON.stringify(e, null, 2)}`))
            }
          } else {
            done(new Error(`
${testCase.name} threw an error when it shouldnt. Error:

${JSON.stringify(e, null, 2)}`));
          }
        });
    });
  });
};
