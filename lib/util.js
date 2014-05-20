var OAuth = require('oauth').OAuth;
var Q = require('q');

// Function to ensure the user is authenticated
// If user is not authenticated, redirect to login
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/fitbit');
}


// Fitbit OAuth
exports.FitbitAPIClient = function(consumerKey, consumerSecret) {
	this.oauth = new OAuth(
		'https://api.fitbit.com/oauth/request_token', //fitbit req token
		'https://api.fitbit.com/oauth/access_token', //fitbit access token
		consumerKey, // developer consumer key
		consumerSecret, //develoepr consumer secret
		'1.0', //current api version.
		'http://fitbitgamify.azurewebsites.net/auth/fitbit/callback',
		'HMAC-SHA1'
	);
};


// Refactor to use a different promises library later!
exports.FitbitAPIClient.prototype = {

	requestResource: function (path, method, accessToken, accessTokenSecret, userId) {
		var url = "https://api.fitbit.com/1/user/" + (userId || "-") + path;
		var deferred = Q.defer();
		this.oauth.getProtectedResource(url, method, accessToken, accessTokenSecret, deferred.makeNodeResolver());
		return deferred.promise;
	},

};

// Easier formatting of dates
Date.prototype.yyyymmdd = function() {         
                                
        var yyyy = this.getFullYear().toString();                                    
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = this.getDate().toString();             
                            
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
   };  

























