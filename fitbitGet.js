var fitbitly = require('./fitbitly.js');
var Q = require('q');
var async = require('async');
var co = require('co');
var thunkify = require('thunkify');
var request = require('request');
// move to modularize later
var db = require('./appData/config.js');
var User = require('./appData/models/user.js');

//dummy function here
exports.getActivities = function (req, res) {
  fitbitly.fitbitClient.requestResource("/activities.json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var response = results[0];
      res.sendfile(__dirname + '/public/client/templates/index.html');
    });
}

// If I'm gonna keep dropping dbs, should probably write in this fn
// to check to make sure that we don't have this subscription already (check the id)
// otherwise page never loads
exports.subscribeUser = function(id,cb) {
  fitbitly.fitbitClient.requestResource("/apiSubscriptions/"+id+".json", "POST", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
	    console.log(id);
	    cb();
    });
}

//eventually do stacked promises...?
exports.getAllFitbitData = function(req,res) {
	//console.log("REQUEST USER:", req.user);
	var date = req.user.createdAt.yyyymmdd();
	fitbitly.fitbitClient.requestResource("/profile.json", "GET", fitbitly.token, fitbitly.tokenSecret)
	    .then(function (results) {
	      var obj = JSON.parse(results[0]).user;
	      req.user.prof = [obj];
	 });

	//get sedentarymins
    fitbitly.fitbitClient.requestResource("/activities/date/"+date+".json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var activities = JSON.parse(results[0]);
      req.user.sedentaryMins = activities.summary.sedentaryMinutes;
      req.user.veryActiveMins = activities.summary.veryActiveMinutes;
      req.user.fairlyActiveMins = activities.summary.fairlyActiveMinutes;
      req.user.lightlyActiveMins = activities.summary.lightlyActiveMinutes;
      req.user.steps = activities.summary.steps;
      req.user.calories = activities.summary.caloriesOut; //not 100% sure if this is accurate representation of calories
    });

	//get sleep
	fitbitly.fitbitClient.requestResource("/sleep/date/"+date+".json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      req.user.sleep = results[0];
    });

    //get badges -- no date!
	fitbitly.fitbitClient.requestResource("/badges.json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var badges = JSON.parse(results[0]).badges;
      badgeArray = [];
      for (var i = 0; i<badges.length;i++ ) {
      	badgeArray.push({"badgeType":badges[i].badgeType,
      					 "timesAchieved": badges[i].timesAchieved,
      					 "value": badges[i].value,
      					 "dateTime": badges[i].dateTime
      					});
      }
      req.user.badges = badgeArray;
    });

    //get friends and also create models for each one if they exist, if they don't then store them!
    fitbitly.fitbitClient.requestResource("/friends.json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var friends = JSON.parse(results[0]).friends;
      var friendsArr = [];
      for (var i = 0; i < friends.length; i++ ) {
      	friendsArr.push(friends[i].user.encodedId);
      }

      req.user.friends = friendsArr;
      console.log('friends', req.user.friends);
      console.log('original id', req.user.originalId);
      User.findOne({originalId: req.user.originalId}, function(err,foundUser) {
      	foundUser.friends = req.user.friends;
      	foundUser.steps = req.user.steps;
      	foundUser.calories = req.user.calories;
      	foundUser.badges = req.user.badges;
      	foundUser.sedentarymins = req.user.sedentarymins;
      	foundUser.veryActiveMins = req.user.veryActiveMins;
      	foundUser.fairlyActiveMins = req.user.fairlyActiveMins;
      	foundUser.lightlyActiveMins = req.user.lightlyActiveMins;
      	foundUser.prof = req.user.prof;
      	foundUser.save(function(err,saved) {
      		res.sendfile(__dirname + '/public/client/templates/index.html');

      	});
      });

    });
}


//------- QUERIES TO THE DATABASE -------//

exports.getProfile = function(req,res) {
	User.findOne({originalId: req.user.originalId}, function(err,foundUser) {
		var profile = foundUser.prof[0];
		res.send(200,profile);
	});
};

exports.getAllStats = function(req, res) {
	User.findOne({originalId: req.user.originalId}, function(err, foundUser) {
		res.send(200,foundUser);
	});
};

//helper fn
var toObject = function(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}

exports.getFriends = function(req, res) {
	var friendsArr = [];
	User.findOneQ({originalId: req.user.originalId})
		.then(function(result) {
			console.log("q", user.);
		}).fail(function(err) {
			console.log(err);
		}).done();

		// eventually convert this promise to work with the following code, to get all friends
	// User.findOne({originalId: req.user.originalId}, function(err, foundUser) {
	// 	var userFriends = toObject(foundUser.friends);
	// 	console.log("USER FRIENDS", userFriends);
	// 	var sent = false;
	// 	for (friend in userFriends) {
	// 		var findFriend = userFriends[friend];
	// 		User.find({originalId: findFriend}, function(err, foundUsers) {
	// 			if(foundUsers[0]) {
	// 				console.log('found a user????',foundUsers[0]);
	// 				friendsArr.push(foundUsers[0]);
	// 				delete userFriends[friend];
	// 			}
	// 			if (Object.keys(userFriends).length === 0 && !sent) {
	// 				console.log('gets here ever');
	// 				console.log("MY ARRAY", friendsArr);
	// 				sent = true;
	// 			} 
	// 		});
	// 	}
	// 	setTimeout(function() {
	// 		console.log(friendsArr);
	// 		res.send(200,friendsArr)}
	// 		, 3500);
	// });
};


