var mongoose = require('mongoose');
var bcrypt = require('bcrypt')

var userSchema = new mongoose.Schema({
	uuid: String,
	created_at: Date,
	updated_at: Date,
	firstName: String,
	lastName: String,
	email: String,
	password: String,
	friends: [String],
	conversations: [String]
});

userSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
