module.exports = e => {
  if (!Array.isArray(e)) {
    e = [e].purge();
  }
  const message = e
    .filter(e => !e.printed)
    .map(formatError).join('\n');
  console.error(message);
  return J({
    printed: true,
    message: message
  });
}

function formatError (e) {
  if (e.stratCode) {
    return formatStratError(e);
  }
  if (e.substrateError) {
    return `Substrate Error:
${JSON.stringify(e.substrateError, null, 2)}`;
  }
  return `Internal stratc failure:
${e.stack}`;
}

function formatStratError (e) {
  return`${e.stratCode}
${e.message}
  at ${e.file}:${e.line}
`;
}
