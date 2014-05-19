var db = require('../config');
var mongoose = require('mongoose');

var storeSchema = mongoose.Schema({

});



module.exports = mongoose.model('Store', storeSchema);
