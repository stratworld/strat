module.exports = function (host, id) {
  return host.runtime === undefined
    ? getBlobImplementation(host, id)
    : getFunctionImplementation(host, id)
}

function getBlobImplementation (host, id) {
  return {
    service: 's3',
    Key: host.name,
    Bucket: id
  }
}

function getFunctionImplementation (host, id) {
  return {
    service: 'lambda',
    FunctionName: `${id}-${host.name}`
  }
}