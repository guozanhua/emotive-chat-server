var mongoose = require('mongoose');

var conversationSchema = new mongoose.Schema({
	uuid: String,
	created_at: Date,
	updated_at: Date,
	userUuids: [String],
  title: String,
	messageUuids: [String]
});

conversationSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
