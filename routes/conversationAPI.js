//create new conversation
//make sure said conversation doesn't already exist by checking uuids of members
exports.createNewConversation = function(req, res) {
	process.nextTick(function() {
		models.Conversation.findOne( {
			userUuids: req.body.userUuids
		}, function(err, conversation) {
			if (err) throw err;
			if (conversation) {
				var oldConversation = {
					"userUuids": conversation.userUuids,
					"title": conversation.title,
					"updated_at": conversation.updated_at
				};
				res.json({
					success: false,
					message: 'Conversation already exists',
					conversation: oldConversation
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

//get particular conversation
exports.getConversation = function(req, res) {
	models.Conversation.findOne( {
		uuid: req.params.uuid
	}, function(err, conversation) {
		if (err) throw err;
		if (!conversation) {
			res.json({ success: false, message: 'Get failed! Conversation not found.' });
		}
		else {
			//use req.query.param to find how recent the messages should be
			var oldConversation = {
				"userUuids": conversation.userUuids,
				"title": conversation.title,
				"updated_at": conversation.updated_at
			};
			res.json({
				success: true,
				message: 'Conversation successfully found!',
				conversation: oldConversation
			});
		}
	});
};

// update conversation
//need to make sure that there aren't 2 conversations with the same people
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
			else if (req.body.userUuids) {
				models.Conversation.findOne({
					userUuids: req.body.userUuids
				}, function(err, matchingConversation) {
					if (err) throw err;
					if (matchingConversation) {
						res.json({
							success: false,
							message: 'Adding users failed because conversation already exists',
							matchingConversationUuid: matchingConversation.uuid
						});
					}
					else {
						conversation.userUuids = req.body.userUuids;
					}
				});
			}

			conversation.save(function(err) {
				if (err) throw err;
				res.json({
					success: true,
					message: 'Conversation successfully updated!',
				});
			});
		}
	});
};