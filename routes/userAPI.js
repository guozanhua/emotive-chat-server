// update users
exports.updateUser = function(req, res) {
	req.models.User.findOne( {
		uuid: req.params.uuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Update failed! User not found.' });
		}
		else {
			//if adding a friend
			if (req.body.newFriends) {
				for (var i = 0; i < req.body.newFriends.length; i++) {
					var friendUUID = req.body.newFriends[i];
					req.models.User.findOne( {
						uuid: friendUUID
					}, function(err, friend) {
						if (err) throw err;
						if (!friend) {
							res.json({ success: false, message: 'Could not find friend.' });
						}
						else {
							friend.friends.push(user.uuid);
							user.friends.push(friendUUID);
							user.save(function(err){
								if (err) throw err;
								friend.save(function(err) {
									if (err) throw err;
									res.json({
										success: true,
										message: 'Friend successfully added to user!',
									});
								});
							});
						}
					});
				}
			}
			//if updating settings
			else {
				if (req.body.firstName && req.body.lastName && req.body.email) {
					user.firstName = req.body.firstName;
					user.lastName = req.body.lastName;
					user.email = req.body.email;
				}
				if (req.body.password) {
					user.password = user.generateHash(req.body.password);
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
		}
	});
};

//get users
exports.getUsers = function(req, res) {
	//get all users except friends of given user
	if (req.query.ignoreFriendsOfUserWithUuid) {
		req.models.User.findOne( {
			uuid: req.query.ignoreFriendsOfUserWithUuid
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Get failed! User not found.' });
			}
			else {
				var uuidsToExclude = [user.uuid];
				for (var index in user.friends) {
					uuidsToExclude.push(user.friends[index]);
				}
				req.models.User.find( { 
					uuid: { $nin: uuidsToExclude } 
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
	//get all users
	else {
		req.models.User.find({}, function(err, users) {
			if (err) throw err;
			if (!users || users.count == 0) {
				res.json({
					success: false,
					message: 'No users found'
				});
			}
			else {
				res.json({
					success: true,
					message: 'Successfully found users',
					users: users
				});
			}
		});
	}
};

//get a specific user
exports.getUser = function(req, res) {
	req.models.User.findOne( {
		uuid: req.params.uuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Get failed! User not found.' });
		}
		else {
			var userObject = { 
				"uuid": user.uuid,
				"email": user.email,
				"firstName": user.firstName,
				"lastName": user.lastName,
				"friends": user.friends
			}
			res.json({
				success: true,
				message: 'User successfully found!',
				user: userObject
			});
		}
	});
}

//get friends for user
exports.getFriendsForUser = function(req, res) {
	req.models.User.findOne( {
		uuid: req.params.uuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Get failed! User not found.' });
		}
		else {
			req.models.User.find( { 
				uuid: { $in: user.friends } 
			}, function(err, friends) {
				if (err) throw err;
				if (!friends) {
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
						var friendObject = { 
							"uuid" : friend.uuid, "firstName" : friend.firstName, "lastName" : friend.lastName 
						};
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

//get conversations for user
exports.getConversationsForUser = function(req, res) {
	req.models.User.findOne( {
		uuid: req.params.uuid
	}, function(err, user) {
		if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Get failed! User not found.' });
		}
		else {
			req.models.Conversation.find({ uuid: { $in: user.conversations } })
			.sort({'updated_at': -1})
			.find(function(err, conversations) {
				if (err) throw err;
				if (!conversations || conversations.length == 0) {
					res.json({
						success: false,
						message: 'No conversations found',
					});
				}
				else {
					var conversationObjects = [];
					var sentConversationIndex = 0;

					for (var index in conversations) {
						req.models.User.find( {
							uuid: { $in: conversations[index].userUuids }
						}, function(err, usersInConversation) {
							if (err) throw err;
							var userObjects = [];
							for (var index2 in usersInConversation) {
								var userInConversation = usersInConversation[index2];
								var userObject = {
									"uuid": userInConversation.uuid,
									"firstName": userInConversation.firstName,
									"lastName": userInConversation.lastName
								};
								userObjects.push(userObject);
							}
							var conversationObject = {
								"uuid": conversations[sentConversationIndex].uuid,
								"userObjects": userObjects,
								"title": conversations[sentConversationIndex].title,
								"updated_at": conversations[sentConversationIndex].updated_at
							};
							conversationObjects.push(conversationObject);
							if (sentConversationIndex == conversations.length-1) {
								res.json({
									success: true,
									message: 'Conversations successfully found',
									conversations: conversationObjects
								});
							}
							else {
								sentConversationIndex++;
							}
						});
					}
				}
			});
		}			
	});
}

