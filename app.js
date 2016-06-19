var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session),
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	rooms = [{
		room_name: "Test Room",
		room_number: 0
	}];

// setting the default paths and rendering engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// detecting the environment
var env = process.env.NODE_ENV || "development";
if("development" === env) {
	app.use(session({secret: config.sessionSecret}));
} else {
	app.use(session({
		secret: config.sessionSecret,
		store: new ConnectMongo({
			// url: config.dbURL,
			mongooseConnection: mongoose.connections[0],
			stringify: true
		})
	}));
}

var models = require('./models/models.js')(mongoose);
// including facebook authentication
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, models);

app.use(passport.initialize());
app.use(passport.session());

// including the routes module
require('./routes/routes.js')(express, app, passport, config, rooms);

app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, models);

server.listen(app.get('port'), function() {
	console.log("Vendetta's Chat Engine serving silently at: " + app.get('port'));
	console.log('Environment: ' + env);
});