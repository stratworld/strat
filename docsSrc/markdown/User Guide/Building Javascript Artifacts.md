# Building Javascript Artifacts

Here's a webpack.config.js file that does the trick.

TODO: explain webpack concepts so somebody new to the tool (and perhaps even npm) can know what's going on.  This may be impossible since even the webpack team can't seem to do this.

```js
const webpack = require('webpack');
const path = require('path');

module.exports = {
  target: 'node',
  entry: {
    //the keys are the [name] in filename below
    //the values are relative to this file
    getSales: './getSales.js',
    setSales: './setSales.js'
  },
  output: {
    path: path.resolve('./'),
    filename: './[name].bundle.js',
    library: 'strat-library',
    libraryTarget: 'umd'
  },
  plugins: [
    // this bit is important--strat is a dependency injected at runtime
    new webpack.IgnorePlugin(/strat/gi)
  ],
};
```

Since webpack is run by javascript hypebeasts it gets very upset unless you run it in the latest and greatest way:

You'll need npm 5+

```sh
npx webpack
```
