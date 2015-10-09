var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	uuid: String,
	created_at: Date,
	updated_at: Date,
  senderUUID: String,
	wooUUID: String,
	text: String
});

messageSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
