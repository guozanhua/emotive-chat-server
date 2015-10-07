//create new conversation. if conversation already exists, return that w/ last 20 messages
exports.createNewConversation = function(req, res) {
	process.nextTick(function() {
		models.Conversation.findOne( {
			userUuids: { $size: req.body.userUuids.length, $in: req.body.userUuids }
		}, function(err, conversation) {
			if (err) throw err;
			if (conversation) {
				models.Messages.find({ uuid: { $in: conversation.messageUuids } })
				.sort({'updated_at': 1})
				.find(function(err, messages) {
					if (err) throw err;
					var oldConversation = {
						"userUuids": conversation.userUuids,
						"title": conversation.title,
						"messages": messages,
						"updated_at": conversation.updated_at
					};
					res.json({
						success: false,
						message: 'Conversation already exists',
						conversation: oldConversation
					});
				});
			}
			else {
				var newConversation = new models.Conversation();
				newConversation.uuid = uuident.v4();
				newConversation.userUuids = req.body.userUuids;

				if (newConversation.uuid && newConversation.userUuids) {
					newConversation.save(function(err) {
						if (err) throw err;
						res.json({
							success: true,
							message: 'Conversation successfully created',
							conversation: newConversation
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
	models.Conversation.findOne( {
		uuid: req.params.uuid
	}, function(err, conversation) {
		if (err) throw err;
		if (!conversation) {
			res.json({ success: false, message: 'Get failed! Conversation not found.' });
		}
		else {
			models.Messages.find({ uuid: { $in: conversation.messageUuids, updated_at: { $gt: req.query.lastUpdateTime } } })
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
	models.Conversation.findOne( {
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
				models.Conversation.findOne({
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