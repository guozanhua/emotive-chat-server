//create new conversation. if conversation already exists, return that w/ last 20 messages
exports.createNewConversation = function(req, res) {
	process.nextTick(function() {
		req.models.Conversation.findOne({
			userUuids: req.body.userUuids
		}, function(err, conversation) {
			if (err) throw err;
			if (conversation) {
				var newMessage = new req.models.Message();
				newMessage.uuid = uuident.v4();
				newMessage.senderUuid = req.body.senderUuid;
				newMessage.wooUuid = req.body.wooUuid;

				newMessage.save(function(err) {
					if (err) throw err;
					conversation.messageUuids.push(newMessage.uuid);
					conversation.save(function(err) {
						if (err) throw err;
						req.models.Message.find({ uuid: { $in: conversation.messageUuids } })
						.sort({'updated_at': 1})
						.find(function(err, messages) {
							req.models.User.find({ 
								uuid: { $in: conversation.userUuids } 
							}, function(err, users) {
								if (err) throw err;
								var userObjects = []
								for (var i = 0; i < users.length; i++) {
									var user = users[i];
									var userObject = {
										"uuid": user.uuid,
										"firstName": user.firstName,
										"lastName": user.lastName
									}
									userObjects.push(userObject);
									if (i == users.length - 1) {
										var oldConversation = {
											"userObjects": userObjects,
											"title": conversation.title,
											"messages": messages,
											"updated_at": conversation.updated_at
										}
										res.json({
											success: false,
											message: 'Conversation already exists',
											conversation: oldConversation
										});
									}
								}
							});
						});
					});
				});
			}
			else {
				var newConversation = new req.models.Conversation();
				newConversation.uuid = uuident.v4();
				newConversation.userUuids = req.body.userUuids;
				if (newConversation.uuid && newConversation.userUuids) {
					var newMessage = new req.models.Message();
					newMessage.uuid = uuident.v4();
					newMessage.senderUuid = req.body.senderUuid;
					newMessage.wooUuid = req.body.wooUuid;

					newMessage.save(function(err) {
						if (err) throw err;
						newConversation.messageUuids.push(newMessage.uuid);
						newConversation.save(function(err) {
							if (err) throw err;
							req.models.User.find({
								uuid: { $in: newConversation.userUuids } 
							}, function(err, users) {
								var userObjects = []
								var saveIndex = 0;
								for (var i = 0; i < users.length; i++) {
									var user = users[i];
									user.conversations.push(newConversation.uuid);
									user.save(function(err) {
										if (err) throw err;
										var userObject = {
											"uuid": user.uuid,
											"firstName": user.firstName,
											"lastName": user.lastName
										}
										userObjects.push(userObject);
										if (saveIndex == users.length-1) {
											var conversationObject = {
												"userObjects": userObjects,
												"messages": newConversation.messageUuids,
												"updated_at": newConversation.updated_at
											}
											res.json({
												success: true,
												message: 'Conversation successfully created',
												conversation: conversationObject
											});
										}
										else {
											saveIndex++;
										}
									});
								}
							});
						});
					});
				}
				else {
					res.json({
						success: false,
						message: 'Conversation unsuccessfully created'
					});
				}
			}
		});
	});
};

//get particular conversation with given # messages
exports.getConversation = function(req, res) {
	req.models.Conversation.findOne( {
		uuid: req.params.uuid
	}, function(err, conversation) {
		if (err) throw err;
		if (!conversation) {
			res.json({ success: false, message: 'Get failed! Conversation not found.' });
		}
		else {
			req.models.Messages.find({ uuid: { $in: conversation.messageUuids, updated_at: { $gt: req.query.lastUpdateTime } } })
			.sort({'updated_at': 1})
			.find(function(err, messages) {
				if (err) throw err;
				var conversationObject = {
					"userUuids": conversation.userUuids,
					"title": conversation.title,
					"messages": messages,
					"updated_at": conversation.updated_at
				};
				res.json({
					success: true,
					message: 'Conversation successfully found',
					conversation: conversationObject
				});
			});
		}
	});
};

// update conversation
exports.updateConversation = function(req, res) {
	req.models.Conversation.findOne( {
		uuid: req.params.uuid
	}, function(err, conversation) {
		if (err) throw err;
		if (!conversation) {
			res.json({ success: false, message: 'Update failed! Conversation not found.' });
		}
		else {
			if (req.body.title) {
				conversation.title = req.body.title;
			}
			if (req.body.userUuids) {
				req.models.Conversation.findOne({
					uuid: req.body.uuid
				}, function(err, matchingConversation) {
					if (err) throw err;
					if (!matchingConversation) {
						conversation.userUuids = req.body.userUuids;
					}
					conversation.save(function(err) {
						if (err) throw err;
						res.json({
							success: true,
							message: 'Conversation successfully updated!'
						});
					});
				});
			}
			else {
				conversation.save(function(err) {
					if (err) throw err;
					res.json({
						success: true,
						message: 'Conversation successfully updated!',
					});
				});
			}
		}
	});
};