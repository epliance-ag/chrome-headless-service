module.exports = {
	logStatus: logStatus
}

function logStatus(requestParams, response, context, ee, next) {
	console.log(response.statusCode);
	return next(); // MUST be called for the scenario to continue
}
