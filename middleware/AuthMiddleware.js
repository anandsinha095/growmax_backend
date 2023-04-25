module.exports = function (req, res, next) {
		if (req.cookies['AuthToken'] && req.session.loggedin == true) {
			next();
		} else {
	   res.redirect('/login');
	}
};
