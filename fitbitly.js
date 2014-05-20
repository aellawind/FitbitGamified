var express = require('express');
var OAuth = require('oauth').OAuth;
var Q = require('q');
var morgan = require('morgan'); // previously logger
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var FitbitStrategy = require('passport-fitbit').Strategy;
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var utils = require('./lib/util.js');
var fitbitGet = require('./fitbitGet.js');

// move to modularize later
var db = require('./appData/config.js');
var User = require('./appData/models/user.js');

// Passport credential configs, sign up
var FITBIT_CONSUMER_KEY = '8cda22173ee44a5bba066322ccd5ed34';
var FITBIT_CONSUMER_SECRET = '12beae92a6da44bab17335de09843bc4';
exports.fitbitClient = new utils.FitbitAPIClient(FITBIT_CONSUMER_KEY, FITBIT_CONSUMER_SECRET);

// returns sufficient identifying information to recover the user account on any subsequent requests
// specifically the second parameter of the done() method is the information serialized into the session data
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// deserialize returns the user profile based on the identifying information that was serialized 
// to the session
passport.deserializeUser(function (id, done) {
  User.findOne(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new FitbitStrategy({
    consumerKey: FITBIT_CONSUMER_KEY,
    consumerSecret: FITBIT_CONSUMER_SECRET,
    callbackURL: "/auth/fitbit/callback"
  },
  function (token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      exports.token = token;
      exports.tokenSecret = tokenSecret;
      User.findOne({
        originalId: profile.id,
        provider: profile.provider
      }, function (err,foundUser) {
        if (foundUser) {
          console.log("This user exists already.");
          fitbitGet.subscribeUser(foundUser.originalId, function() {
            done(null, foundUser);
          }); //eventually remove this and only do it for new users
        } else {
          var newUser = new User({
            originalId: profile.id,
            provider: profile.provider,
            displayName: profile.displayName
          });
          newUser.save(function (err, savedUser) {
            if (err) {throw err;}
            console.log("New user: " + savedUser);
            fitbitGet.subscribeUser(savedUser.originalId);
            done(null, savedUser);
          });
        }
      });
    });
  }
));

// App configurations
//app.use(morgan()); //annoying logger every time server runs
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({secret: 'keyboard cat',maxAge: 360 * 5
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Home page, either redirects to main page or to login
app.get('/', utils.ensureAuthenticated, function (req, res) {
  res.redirect('/FitbitRPG');
});

// Sends the user to get authenticated with fitbit
app.get('/auth/fitbit',
  passport.authenticate('fitbit'),
  function (req, res) {
    // The request will be redirected to Fitbit for authentication, so this
    // function will not be called.
  });


// Main game page
app.get('/FitbitRPG', utils.ensureAuthenticated, fitbitGet.getFriends);

app.get('/activities', utils.ensureAuthenticated, fitbitGet.getActivities);

// GET /auth/fitbit/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/fitbit/callback',
  passport.authenticate('fitbit', {
    failureRedirect: '/lala'
  }),
  function (req, res) {
    res.redirect('/');
});

// The callback user gets sent to after authentication at fitbit, just redirects to the game
app.get('/auth/fitbit/callback',
  passport.authenticate('fitbit', {
    failureRedirect: '/lala'
  }),
  function (req, res) {
    res.redirect('/FitbitRPG');
});

// Performs a function 'logout', not 100% sure what that entails quite yet.
app.get('/logout', function (req, res) {
  console.log('gets here');
  req.logout();
  res.redirect('/');
});

// THE BELOW IS A TESTING FUNCTION TO SEE ALL USERS IN MY DB, REMOVE LATER
app.get('/homes', function (req, res) {
  User.find({}, function(err,user) {
    console.log('USER', err, user);
  });
  res.sendfile(__dirname + '/public/client/templates/homes.html');
});

// THEORETICALLY RECEIVE PUSH NOTIFICATIONS FROM FITBIT
app.get('/fitbitpush', function(req, res) {
  console.log("Fitbit pushed!");
  console.log(req,res);
  res.writeHead(204);
  res.end();
});

module.exports = app;