var mongoose = require('mongoose');
var fs = require('fs');

var wooSchema = new mongoose.Schema({
	uuid: String,
	orderedImageFileNames: [String]
});

module.exports = mongoose.model('Message', messageSchema);
