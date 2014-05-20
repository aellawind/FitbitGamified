// This file configures the mongoose database
var mongoose = require('mongoose');
var db = mongoose.connection;

// When there is an error, log it to the console
db.on('error', console.error.bind(console, 'connection error:'));

var connection = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/27017';
mongoose.connect(connection);
module.exports = db;






































































