var fitbitly = require('./fitbitly.js');
var Q = require('q');
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

exports.subscribeUser = function(cb) {
  return fitbitly.fitbitClient.requestResource("/apiSubscriptions/320.json", "POST", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
	    cb();
    });
}

//eventually do stacked promises...?
exports.getAllFitbitData = function(req,res) {
	
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
      User.findOne({originalID: req.originalID}, function(err,foundUser) {
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
      		console.log("saving", saved);
      		res.sendfile(__dirname + '/public/client/templates/index.html');

      	})
      });

    });
}


//------- QUERIES TO THE DATABASE -------//

exports.getProfile = function(req,res) {
	User.findOne(req.user.originalID, function(err,foundUser) {
		var profile = foundUser.prof[0];
		res.send(200,profile);
	});
};

exports.getAllStats = function(req, res) {
	User.findOne(req.user.originalID, function(err, foundUser) {
		res.send(200,foundUser);
	});
};

exports.getFriends = function(req, res) {

};


