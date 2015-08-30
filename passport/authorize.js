var User = require('../models/user');

module.exports = function(passport) {

	passport.use(new LocalStrategy({
	    usernameField: 'email',
	    passwordField: 'passwd',
	    passReqToCallback: true,
	    session: false
	  },
	  function(req, username, password, done) {
	    // request object is now first argument
	    // ...
	  }
	));
};