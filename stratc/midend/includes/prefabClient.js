const https = require("https");
const http = require("http");
const { URL } = require('url');

//this needs to be a hell of a lot more complex
//todo: pay attention to content types
function fetch (url) {
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
    h.get(url, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {

        //Assume JSON (todo)
        resolve(JSON.parse(body));
      });
    });
  });
}

module.exports = (event, declaration) => {
  const pathTokens = declaration.path.split('/');
  pathTokens[pathTokens.length - 1] = declaration.name;
  return fetch(pathTokens.join('/'));
};
