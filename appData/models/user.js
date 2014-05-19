var db = require('../config');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({

});



module.exports = mongoose.model('User',userSchema);
