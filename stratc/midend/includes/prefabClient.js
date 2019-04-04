const https = require("https");
const http = require("http");
const { URL } = require('url');

function fetch (method, event, url) {
  const u = new URL(url);
  const host = u.hostname;
  const protocol = u.protocol;
  var h = https;
  if (protocol === 'http:') {
    if (host !== 'localhost') {
      throw `Connecting to remote host (${host}) by http is not supported.`;
    }
    h = http;
  }
  
  return new Promise(function (resolve, reject) {
    function respond (res) {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        const status = res.statusCode;
        const preferedResolve = status === 200
          ? resolve
          : reject;
        //Assume JSON responses are normal
        //If its not JSON, its probably an error
        try {
          preferedResolve(JSON.parse(body))
        } catch (e) {
          reject(body);
        }
      });
    }

    if (method === 'post') {
      post(h, url, event, respond);
    } else {
      h.get(url, respond);
    }
  });
}

function post (transport, url, data, respond) {
  const payload = JSON.stringify(data);
  const u = new URL(url);
  const options = {
    hostname: u.hostname,
    port: u.port,
    path: u.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  const req = transport.request(options, respond);

  req.on('error', (e) => {
    throw e;
  });

  req.write(payload);
  req.end();
}

module.exports = (event, declaration) => {
  const pathTokens = declaration.path.split('/');
  pathTokens[pathTokens.length - 1] = declaration.name;
  const method = declaration.signature.input === undefined
    ? 'get'
    : 'post';
  return fetch(method, event, pathTokens.join('/'));
};
