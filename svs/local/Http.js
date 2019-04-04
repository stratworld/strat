const http = require('http');

module.exports = function (proxy, config) {
  const port = config.port || 3000;
  function listener (request, response) {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      proxy({
        path: request.url,
        httpMethod: request.method,
        body: chunks.length > 0 ? body : undefined
      })
      .then(result => format(result, response))
      .catch(error => formatError(error, response));
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

function format(result, res) {
  res.writeHead(result.statusCode, result.headers);
  if (result.body) {
    res.write((typeof result.body === 'string'
      ? result.body
      : JSON.stringify(result.body)));
  }
  res.end();
}

function formatError (error, res) {
  res.writeHead(500);
  res.write(JSON.stringify(err));
  res.end();
}
