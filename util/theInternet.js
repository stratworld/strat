const https = require("https");
const http = require("http");
const { URL } = require('url');
const stdPath = require('path');

function isUrl (string) {
  const urlRegex = /^(https:|http:\/\/localhost).*/g;
  return urlRegex.test(string);
}

// only allow http on localhost; everything else should be https
function fetch (target) {
  return new Promise(function (resolve, reject) {

    const parsed = new URL(target);

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

const path = {
  dirname: function (url) {
    const parsed = new URL(url);
    return parsed.origin + stdPath.dirname(parsed.pathname);
  },
  resolve: function (baseUrl, relativePath) {
    const parsed = new URL(baseUrl);
    return parsed.origin + stdPath.resolve(parsed.pathname, relativePath);
  },
  extname: function (url) {
    const parsed =  new URL(url);
    return stdPath.extname(parsed.pathname);
  },
  isAbsolute: function (url) {
    return isUrl(url);
  }
}

module.exports = {
  cat: fetch,
  isUrl: isUrl,
  path: path
};
