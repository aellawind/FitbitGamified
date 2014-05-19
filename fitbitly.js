var express = require('express');
var OAuth = require('oauth').OAuth;
var Q = require('q');
var morgan = require('morgan'); // previously logger
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var FitbitStrategy = require('passport-fitbit').Strategy;
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var utils = require('./lib/util.js');


// Passport credential configs, sign up
var FITBIT_CONSUMER_KEY = '8cda22173ee44a5bba066322ccd5ed34';
var FITBIT_CONSUMER_SECRET = '12beae92a6da44bab17335de09843bc4';
var fitbitClient = new utils.FitbitAPIClient(FITBIT_CONSUMER_KEY, FITBIT_CONSUMER_SECRET);
var globalVar = {}; 

// returns sufficient identifying information to recover the user account on any subsequent requests
// specifically the second parameter of the done() methodis the information serialized into the session data
passport.serializeUser(function(user, done) {
  console.log("A",user);
  done(null, user);
});


// deserialize returns the user profile based on the identifying information that was serialized 
// to the session
passport.deserializeUser(function(obj, done) {
  //console.log("B",obj);
  done(null, obj);
});

passport.use(new FitbitStrategy({
    consumerKey: FITBIT_CONSUMER_KEY,
    consumerSecret: FITBIT_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:4567/auth/fitbit/callback"
  },
  function(token, tokenSecret, profile, done) {
    globalVar.token = token;
    globalVar.tokenSecret = tokenSecret;
    console.log("@",globalVar.token, globalVar.tokenSecret);
    // asynchronous verification, for effect...
    process.nextTick(function () {
    console.log(profile);
        return done(null, profile);
    });
  }
));

// App configurations
//app.use(morgan()); //annoying logger every time server runs
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', maxAge: 360*5}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Home page, either redirects to main page or to login
app.get('/', function(req, res) {
	console.log('gets here');
	console.log('here',req.session.oauth_access_token);
	if(!req.session.oauth_access_token) {
		res.redirect('/auth/fitbit');
	} else {
		res.redirect('/FitbitRPG');
	}
});	

// Sends the user to get authenticated with fitbit
app.get('/auth/fitbit',
  passport.authenticate('fitbit'),
  function(req, res){
    // The request will be redirected to Fitbit for authentication, so this
    // function will not be called.
});

// The callback user gets sent to after authentication
app.get('/auth/fitbit/callback', 
  passport.authenticate('fitbit', { failureRedirect: '/lala' }), 
  function(req, res) {
    res.redirect('/FitbitRPG');
});

app.get('/FitbitRPG',  utils.ensureAuthenticated, function(req,res) {	
	console.log("@",globalVar.token, globalVar.tokenSecret);
	return fitbitClient.requestResource("/friends.json", "GET", globalVar.token, globalVar.tokenSecret)
	.then(function (results) {
			console.log("HERE");
			var response = results[0];
			console.log(response);
			res.sendfile(__dirname+'/public/client/templates/index.html');

	});
});


// exports.fetchLinks = function(req, res) {
//   console.log('fetched');
//   Link.find({}, function(err,links){
//     res.send(200,links);
//   });
// };


app.get('/homes', function(req,res) {
	res.sendfile(__dirname+'/public/client/templates/homes.html');
});

// GET /auth/fitbit
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Fitbit authentication will involve redirecting
//   the user to fitbit.com.  After authorization, Fitbit will redirect the user
//   back to this application at /auth/fitbit/callback


// GET /auth/fitbit/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/fitbit/callback', 
  passport.authenticate('fitbit', { failureRedirect: '/lala' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res){
  console.log('gets here');
  req.logout();
  res.redirect('/');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.

module.exports = app;