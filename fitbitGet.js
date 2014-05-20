var fitbitly = require('./fitbitly.js');

exports.getFriends = function (req, res) {
  return fitbitly.fitbitClient.requestResource("/friends.json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var response = results[0];
      console.log(response);
      res.sendfile(__dirname + '/public/client/templates/index.html');
    });
}

exports.getActivities = function (req, res) {
  return fitbitly.fitbitClient.requestResource("/activities.json", "GET", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      var response = results[0];
      console.log(response);
      res.sendfile(__dirname + '/public/client/templates/index.html');
    });
}

exports.subscribeUser = function(id,cb) {
	console.log('gets to the subscribe');
	return fitbitly.fitbitClient.requestResource("/apiSubscriptions/320.json", "POST", fitbitly.token, fitbitly.tokenSecret)
    .then(function (results) {
      console.log("POST WORKED");
      var response = results[0];
      console.log(response);
      cb();
    });
}
