//require dependencies
var express = require('express');
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	models = require('./models'),
	dbUrl = process.env.MONGOHQ_URL || 'mongodb://localhost:27017/chat';

//mongoose
var mongoose = require('mongoose');
mongoose.connect(dbUrl, {safe: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

});


//middleware
var logger = require('morgan'),
	errorHandler = require('errorhandler'),
	bodyParser = require('body-parser'),
	jwt = require('jsonwebtoken'),
	methodOverride = require('method-override');
	uuident = require('node-uuid');

var app = express();
app.locals.appTitle = 'Chat';


//middleware that exposes Mongoose models in each Express.js route via a req object
app.use(function(req, res, next) {
	if (!models.User) return next(new Error('No models.'));
	req.models = models;
	return next();
});

//configure settings
app.set('port', process.env.PORT || 3003);
app.set('secret', process.env.SECRET || 'supersecret');

//use middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + 'public'));
app.use(express.static(path.join(__dirname, 'public')));

//error handling if environment is development
if ('development' == app.get('env')) {
	app.use(errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
}
else if ('production' == app.get('env')) {
	app.use(errorHandler());
}

//REST API routes

app.put('/api/user', function(req, res) {
	models.User.findOne( {
		uuid: req.body.uuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Update failed! User not found.' });
		}
		else {
			if (req.body.firstName && req.body.lastName && req.body.email) {
				user.firstName = req.body.firstName;
				user.lastName = req.body.lastName;
				user.email = req.body.email;
			}
			if (req.body.password) {
				user.password = user.generateHash(req.body.password);
			}
			if (req.body.friends) {
				for (var i = 0; i < req.body.friends.length; i++) {
					user.friends.push(req.body.friends[i]);
				}
			}

			user.save(function(err){
				if (err) {
					throw err;
				}
				res.json({
					success: true,
					message: 'User successfully updated!',
				});
			});
		}
	});
});

app.get('/api/user', function(req, res) {
	models.User.findOne( {
		uuid: req.query.uuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Get failed! User not found.' });
		}
		else {
			
			var friendsNameAndUuid = [];
			var friendUsers = db.collection('users').find( { uuid: { $in: user.friends } } );
			friendUsers.each(function(err, friend) {
				if (err) throw err;
				if (friend == null) {

					if (friendsNameAndUuid) {
						res.json({
							success: true,
							message: 'Found all friend names!',
							friends: friendsNameAndUuid
						});
					}
					else {
						res.json({ success: false, message: "Could not get user info!" });
					}
				}
				else {
					if(friend.uuid!=null){
						var nameAndUuid = [friend.firstName.concat(" ").concat(friend.lastName), friend.uuid];
						friendsNameAndUuid.push(nameAndUuid);
					}
					
				}
			});
		}
	});
});

app.get('/api/users', function(req, res) {
	models.User.findOne( {
		uuid: req.query.ignoreFriendsOfUserWithUuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Get failed! User not found.' });
		}
		else {
			var friendsNameAndUuid = [];
			var otherUsers = db.collection('users').find( { uuid: { $nin: user.friends } } );
			otherUsers.each(function(err, other) {
				if (err) throw err;
				if (other == null) {

					if (friendsNameAndUuid) {
						res.json({
							success: true,
							message: 'Found all friend names!',
							friends: friendsNameAndUuid
						});
					}
					else {
						res.json({ success: false, message: "Could not get user info!" });
					}
				}
				else {
					if(other.uuid!=null){
						var nameAndUuid = [other.firstName.concat(" ").concat(other.lastName), other.uuid];
						friendsNameAndUuid.push(nameAndUuid);
					}
					
				}
			});
		}
	});
});

app.post('/api/signup', function(req, res) {
	//async. User.findOne won't fire unless data is sent back
	process.nextTick(function() {
		models.User.findOne( {
			email: req.body.email
		}, function(err, user) {
			if (err) throw err;
			if (user) {
				res.json({ success: false, message: 'Signup failed! User with given email already exists.' });
			}
			else {

				var newUser = new models.User();

				newUser.firstName = req.body.firstName;
				newUser.lastName = req.body.lastName;
				newUser.email = req.body.email;
				newUser.password = newUser.generateHash(req.body.password);
				newUser.uuid = uuident.v4()

				if (newUser.firstName && newUser.lastName && newUser.email && newUser.password && newUser.uuid) {
					newUser.save(function(err){
						if (err) {
							throw err;
						}
						res.json({
							success: true,
							message: 'User successfully created!',
						});
					});
				}
				else {
					res.json({
						success: false,
						message: 'Failed to generate new user. At least one field is missing',
					});
				}
			}
		});
	});
});

app.post('/api/authenticate', function(req, res) {
	models.User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found' });
		}
		else {
			if (user.validPassword(req.body.password)) {
				var token = jwt.sign(user, app.get('secret'), {
					expiresInMinutes: 1440 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Token successfully generated!',
					uuid: user.uuid,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					friends: user.friends,
					token: token
				});
			}
			else {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			}
		}
	});
});

//add authentication middleware middleware -- NEEDS TO BE AFTER api/authenticate
app.all('/api', function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['X-Auth-Token'];

	if (token) {
		jwt.verify(token, app.get('secret'), function(err, decoded) {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			}
			else {
				req.decoded = decoded;
				next();
			}
		});
	}
	else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

//catch-all error 404 response
app.all('*', function(req, res) {
	res.send(404);
});

//start server
var server = http.createServer(app);
var boot = function() {
	server.listen(app.get('port'), function() {
		console.info('Express server listening on port ' + app.get('port'));
	});
	server.on('error', function(err) {
		console.error(err);
	});
}
var shutdown = function() {
	server.close();
}

if (require.main === module) {
	boot();
}
else {
	console.info('Running app as a module');
	exports.boot = boot;
	exports.shutdown = shutdown;
	exports.port = app.get('port');
}

//uncaught error handling
process.on('uncaughtException', function(err) {
	console.error('uncaughtException: ', err.message);
	console.error(err.stack);
	process.exit(1);
});

