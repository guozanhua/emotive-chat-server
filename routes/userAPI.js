// update users
app.put('/api/users', function(req, res) {
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
});

//get users
app.get('/api/users', function(req, res) {
	//get a specific user
	if (req.query.uuid) {
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
						if(friend.uuid != null){
							var nameAndUuid = [friend.firstName.concat(" ").concat(friend.lastName), friend.uuid];
							friendsNameAndUuid.push(nameAndUuid);
						}
						
					}
				});
			}
		});
	}
	//get all users excpet friends of given user
	else if (req.query.ignoreFriendsOfUserWithUuid) {
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
	}
});