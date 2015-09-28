var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	uuid: String,
	wooUUID: String,
	text: String
});

module.exports = mongoose.model('Message', messageSchema);
