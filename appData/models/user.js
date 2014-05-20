var db = require('../config');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	originalId: String,
    provider: String,
    displayName: String,
    prof: [],
    createdAt: { type: Date, required: true, default: Date.now },
    sleep: {required:false},
    badges: [],
    sedentaryMins: {required:false},
    veryActiveMins: {required:false},
    fairlyActiveMins: {required:false},
    lightlyActiveMins: {required:false},
    calories: {required:false},
    steps: {required:false},
    friends: [],
    workoutLog: {required:false}
});

module.exports = mongoose.model('User',userSchema);

