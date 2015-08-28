//redirect to main page for logout
exports.logout = function(req, res, next) {
	req.logout();
}
