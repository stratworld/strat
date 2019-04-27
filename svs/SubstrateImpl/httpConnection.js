const http = require('http');
const Strat = require('strat').getResolver();
const dispatch = Strat.dispatch;

module.exports = function () {
  const port = 3000;
  function listener (request, response) {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', function dispatchHttpEvent () {
      const body = Buffer.concat(chunks).toString();
      dispatch({
        path: request.url,
        method: request.method.toLowerCase(),
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
      console.log(`http source listening on http://localhost:${port}`);
    })
  });
};

function format(result, res) {
  res.writeHead(result.status, result.headers);
  if (result.body) {
    res.write((typeof result.body === 'string'
      ? result.body
      : JSON.stringify(result.body)));
  }
  res.end();
}

function formatError (error, res) {
  res.writeHead(500);
  res.write(error.stack);
  res.end();
}
