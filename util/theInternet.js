const https = require("https");
const http = require("http");
const url = require('url');

function isUrl (string) {
  const urlRegex = /^(https:|http:\/\/localhost).*/g;
  return urlRegex.test(string);
}

// only allow http on localhost; everything else should be https
function fetch (target) {
  return new Promise(function (resolve, reject) {

    const parsed = url.parse(target);

    (parsed.hostname === 'localhost' && parsed.protocol === 'http:'
      ? http
      : https)
      .get(target, res => {
        const data = [];
        res.on("data", chunk => {
          data.push(chunk);
        });
        res.on("end", () => {
          resolve(Buffer.concat(data));
        });
    });
  });
}

module.exports = {
  fetch: fetch,
  isUrl: isUrl
};
