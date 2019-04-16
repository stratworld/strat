const path = require('path');
const compiler = require('../../compile')();
const assert = require('assert');
const absolutify = fileData => compiler(
  null,
  'absolutify',
  fileData,
  path.resolve(__dirname, './fileInput.st'));
const { traverse } = require('../../../../stratc/ast');

/*
We need to actually look at what is injected into the AST
the point of this and includes is to create a high quality AST
so we have to validate the AST directly

Test:
  that it builds the artifact property for every type of input:
    includes
    artifacts
      dispatches
      functions

  validate the integrity of the artifact property
    token property
    declaredFile
    absolutePath
      buffer, file, url
    type
      buffer, file, url
    media
      different media types
*/

//todo: make this less lazy/copy+paste-y
describe('absolutify', () => {
  describe('artifact property completeness', () => {
    it('should create an artifact property for includes', async () => {
      const ast = await absolutify('service foo { include "./y.js"}');
      const include = traverse(ast, ['service', 'body', 'include'])[0];
      assert(typeof include.artifact === 'object');
    });
    it('should create an artifact property for 2 includes', async () => {
      const ast = await absolutify('service foo { include "./y.js" include "./z.js" }');
      const includes = traverse(ast, ['service', 'body', 'include']);
      includes.forEach(include => {
        assert(typeof include.artifact === 'object');  
      });
    });
    it('should create an artifact property for function', async () => {
      const ast = await absolutify(`service foo {
        fooFn ():any -> "./y.js"
      }`);
      const fn = traverse(ast, ['service', 'body', 'function'])[0];
      assert(typeof fn.artifact === 'object');
    });
    it('should create an artifact property for 2 functions', async () => {
      const ast = await absolutify(`service foo {
        fooFn ():any -> "./y.js"
        fooFnTwo ():any -> "./z.js"
      }`);
      const fns = traverse(ast, ['service', 'body', 'function']);
      fns.forEach(fn => assert(typeof fn.artifact === 'object'));
    });
    it('should create an artifact property for dispatch', async () => {
      const ast = await absolutify(`service foo {

        Birth -> fooFn ():any -> "./y.js"
      }`);
      const fn = traverse(ast, ['service', 'body', 'dispatch'])[0];
      assert(typeof fn.artifact === 'object');
    });
  });
  describe('artifact property correctness', () => {
    it('should create the correct artifact property for an include', async () => {
      const ast = await absolutify('service foo { include "./y.js"}');
      const include = traverse(ast, ['service', 'body', 'include'])[0];
      const a = include.artifact;
      assert(a.type === 'file');
      assert(a.media === '.js');
      assert(a.absolutePath === path.resolve(__dirname, './y.js'));
      assert(a.token.line === 1);
    });
    it('should create the correct artifact property for a function', async () => {
      const ast = await absolutify(`service foo {
        fooFn ():any -> "text"
      }`);
      const fn = traverse(ast, ['service', 'body', 'function'])[0];
      const a = fn.artifact;
      assert(a.type === 'text');
      assert(a.media === '.txt');
      assert(a.absolutePath === false);
      assert(a.token.line === 2);
    });
  });
});
