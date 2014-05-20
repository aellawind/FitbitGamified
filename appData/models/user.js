var db = require('../config');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	originalId: String,
    provider: String,
    displayName: String
});

module.exports = mongoose.model('User',userSchema);
