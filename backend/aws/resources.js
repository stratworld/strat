module.exports = function (host, id) {
  return host.runtime === undefined
    ? getBlobImplementation(host, id)
    : getFunctionImplementation(host, id)
}

function getBlobImplementation (host, id) {
  return {
    type: 'blob',
    service: 's3',
    Key: host.name,
    Bucket: id
  }
}

function getFunctionImplementation (host, id) {
  return {
    type: 'function',
    service: 'lambda',
    FunctionName: `${id}-${host.name}`
  }
}