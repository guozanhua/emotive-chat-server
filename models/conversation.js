var mongoose = require('mongoose');

var conversationSchema = new mongoose.Schema({
	uuid: String,
	userUuids: [String],
	messageUuids: [String]
});

module.exports = mongoose.model('Conversation', conversationSchema);
