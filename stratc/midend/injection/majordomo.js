module.exports = deps => (ast, filename) => {
  ast.hosts.values().forEach(host => {
    host.artifacts.unshift({
      name: 'Strat.majordomo',
      token: {
        value: './majordomo.js',
        line: 0,
        type: 'STRING'
      },
      declaredFile: filename,
      absolutePath: deps.fs.path.resolve(__dirname, '../../../std/majordomo.bundle.js'),
      type: 'file',
      media: '.js'
    });
  });
  return ast;
};
