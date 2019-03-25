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
  return `Internal stratc failure:
${JSON.stringify(e, null, 2)}`;
}

function formatStratError (e) {
  return`${e.stratCode}
${e.message}
  at ${e.file}:${e.line}
`;
}
