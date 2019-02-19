const http = require('http');
const path = require('path');

module.exports = function (events, implementation, sourceConfig) {
  const port = sourceConfig !== undefined && sourceConfig.port !== undefined
    ? sourceConfig.port
    : 3000;

  const proxy = require(path.resolve(implementation, 'lit_generated_host_entry')).handler;
  function listener (request, response) {
    proxy({
      path: request.url,
      httpMethod: request.method
    }, null, function (err, result) {
      format(err, result, response);
    });
  }

  return new Promise(function(resolve, reject) {
    http.createServer(listener).listen(port, e => {
      if (e) {
        reject(e);
      }
      //never resolve
      //todo: run this in background as a child of the main lit build process
      // so that multiple different event sources can run
      console.log(`http source listening on http://localhost:${port}`);
    })
  });
};

function format (err, result, res) {
  if (err) {
    res.writeHead(500);
    res.write(JSON.stringify(err));
    res.end();
  } else {
    res.writeHead(result.statusCode, result.headers);
    if (result.body) {
      res.write((typeof result.body === 'string'
        ? result.body
        : JSON.stringify(result.body)));
    }
    res.end();
  }
}
