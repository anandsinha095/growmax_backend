module.exports = function (request, response, next) {
      
	if(request.session && request.session.loggedin != undefined && request.session.loggedin == true) {
	    if(request.session.user != undefined && request.session.user.role_id != 1) {
	    	response.redirect('/dashboard');
	    }
	    next();
	} else {
	   response.redirect('/login');
	}
};
