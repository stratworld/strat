const TokenFeed = require("./tokenFeed");

module.exports = function (tokens) {
	const tokenFeed = TokenFeed(tokens.tokens);
	
	function error (nextToken, errorMsg) {
		return {
			token: nextToken,
			msg: errorMsg
		};
	}

	const descend = next => Grammar[next]();
	const Statements = require('./statements')(tokenFeed, error, descend);
	const Grammar = require('./grammar')(Statements);

	const file = Grammar.file();
	file.tokens.path = {
		value: tokens.path,
		line: 0,
		type: 'STRING'
	};
	return file;
}
