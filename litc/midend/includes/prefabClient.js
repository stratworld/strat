const http = require("http");
const { URL } = require('url');

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
  const origin = (new URL(declaration.file)).origin;


  // fuck I have no idea
  // this needs to figure out where to call based on the service and function name
  return fetch("http://localhost:3000/foo");
};
