// update users
exports.updateUser = function(req, res) {
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
			if (req.body.newFriends) {
				for (var i = 0; i < req.body.newFriends.length; i++) {
					user.friends.push(req.body.newFriends[i]);
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
};

//get users
exports.getUsers = function(req, res) {
	//get a specific user
	console.log("received request for user");
	console.log(req.query.uuid);
	if (req.query.uuid) {
		models.User.findOne( {
			uuid: req.query.uuid
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Get failed! User not found.' });
			}
			else {
				models.User.find( { 
					uuid: { $in: user.friends } 
				}, function(err, friends) {
					if (err) throw err;
					if (friends == null) {
						res.json({
							success: true,
							message: 'No Friends Found',
						});
					}
					else {
						var friendObjects = [];
						for (var index in friends) {
							var friend = friends[index];
							if (err) {
								throw err;
							}
							var friendObject = { "uuid" : friend.uuid, "firstName" : friend.firstName, "lastName" : friend.lastName };
							friendObjects.push(friendObject);

						}
						res.json({
							success: true,
							message: 'Friends successfully found',
							friends: friendObjects
						});
					}
				});
			}			
		});
	}
	//get all users except friends of given user
	else if (req.query.ignoreFriendsOfUserWithUuid) {
		models.User.findOne( {
			uuid: req.query.ignoreFriendsOfUserWithUuid
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Get failed! User not found.' });
			}
			else {
				models.User.find( { 
					uuid: { $nin: [user.uuid, user.friends] } 
				}, function(err, potentialFriends) {
					if (err) {
						throw err;
					}
					var potentialFriendObjects = [];
					for (var index in potentialFriends) {
						var potentialFriend = potentialFriends[index];
						if (err) {
							throw err;
						}
						var potentialFriendObject = { "uuid" : potentialFriend.uuid, "firstName" : potentialFriend.firstName, "lastName" : potentialFriend.lastName };
						potentialFriendObjects.push(potentialFriendObject);
					}
					res.json({
						success: true,
						message: 'Found potential friends',
						potentialFriends: potentialFriendObjects
					});
				});
			}
		});
	}
};