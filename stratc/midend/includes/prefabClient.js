const http = require("http");
const { URL } = require('url');

//this needs to be a hell of a lot more complex
//todo: pay attention to content types
function fetch (url) {
  return new Promise(function (resolve, reject) {
    http.get(url, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        resolve(body);
      });
    });
  });
}

module.exports = (event, declaration) => {
  const origin = (new URL(declaration.path)).origin;
  return fetch(`${origin}/strat/${declaration.service}/${declaration.name}`);
};
