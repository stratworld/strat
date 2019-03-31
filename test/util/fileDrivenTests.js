const fsFactory = require('../mocks/mockFileSystem');
const internetFactory = require('../mocks/mockInternet');
const compileFactory = require('../stratc/compile');

module.exports = function (cases, stop) {
  cases.forEach(testCase => {
    it(testCase.name, done => {
      const fs = fsFactory(testCase.files);
      const internet = internetFactory(testCase.files);
      const compile = compileFactory({
        fs: fs,
        internet: internet
      });
      compile(
        null,
        stop,
        fs.cat(testCase.entry),
        testCase.entry)
        .then(resultAst => {
          if (testCase.stratCode !== undefined) {
            done(new Error(`${testCase.name} didn't throw ${testCase.stratCode} when an error was expected.`));
          } else {
            if (typeof testCase.assertion === 'function') {
              testCase.assertion(resultAst, done);
            } else {
              done();
            }
          }
        })
        .catch(e => {
          if (Array.isArray(e)) e = e[0];
          if (testCase.stratCode !== undefined) {
            if (testCase.stratCode === e.stratCode) {
              done();
            } else {
              done(new Error(`${testCase.name} didn't throw the correct error code
  expected ${testCase.stratCode} got ${e.stratCode}.  Error:

${stringifyError(e)}`))
            }
          } else {
            done(new Error(`
${testCase.name} threw an error when it shouldnt. Error:

${stringifyError(e)}`));
          }
        });
    });
  });
};

function stringifyError (e) {
  if (e instanceof Error) {
    return e.stack;
  }
  return JSON.stringify(e, null, 2);
}
