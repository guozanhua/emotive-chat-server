var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	id: String,
	nickname: String,
	fullName: String,
	email: String,
	password: String,
});

module.exports = mongoose.model('User', userSchema);