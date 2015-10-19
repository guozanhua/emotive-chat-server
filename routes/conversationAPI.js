//create new conversation. if conversation already exists, return that w/ last 20 messages
exports.createNewConversation = function(req, res) {
	process.nextTick(function() {
		req.models.Conversation.findOne({
			userUuids: { $size: req.body.userUuids.length, $in: req.body.userUuids }
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
						req.models.Messages.find({ uuid: { $in: conversation.messageUuids } })
						.sort({'updated_at': 1})
						.find(function(err, messages) {
							var oldConversation = {
								"userUuids": conversation.userUuids,
								"title": conversation.title,
								"messages": messages,
								"updated_at": conversation.updated_at
							}
							res.json({
								success: false,
								message: 'Conversation already exists',
								conversation: oldConversation
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
							var conversationObject = {
								"userUuids": newConversation.userUuids,
								"messages": newConversation.messageUuids,
								"updated_at": newConversation.updated_at
							}
							res.json({
								success: true,
								message: 'Conversation successfully created',
								conversation: conversationObject
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