var fitbitly = require('./fitbitly.js');
var Q = require('q');

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
      console.log("POST WORKED");
      var response = results[0];
      console.log(response);
      cb();
    });
}

//eventually do stacked promises...?
exports.getAllData = function(req,res) {
	
	var date = req.user.createdAt.yyyymmdd();

	//get sedentarymins
    fitbitly.fitbitClient.requestResource("/activities/date/"+date+".json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var activities = JSON.parse(results[0]);
      console.log(activities);
      req.user.sedentaryMins = activities.summary.sedentaryMinutes;
      req.user.veryActiveMins = activities.summary.veryActiveMinutes;
      req.user.fairlyActiveMins = activities.summary.fairlyActiveMinutes;
      req.user.lightlyActiveMins = activities.summary.lightlyActiveMinutes;
      req.user.steps = activities.summary.steps;
      req.user.calories = activities.summary.caloriesOut;

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
      res.sendfile(__dirname + '/public/client/templates/index.html');
      console.log(req.user);
    });

    
    //get calories - NEED TO GET BMR, AS WELL AS ACTIVITY CALS, DO LATER
    // fitbitly.fitbitClient.requestResource("/sleep/date/"+date+".json", "GET", fitbitly.token, fitbitly.tokenSecret)
    // .then(function (results) {
    //   req.user.sleep = results[0];
    // });

}