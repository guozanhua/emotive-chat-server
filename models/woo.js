var mongoose = require('mongoose');

var wooSchema = new mongoose.Schema({
	uuid: String,
	orderedImageFileNames: [String]
});

module.exports = mongoose.model('Woo', wooSchema);
