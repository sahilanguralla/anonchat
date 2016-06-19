module.exports = function(express, app, passport, config, model) {
	var router = express.Router();

	function authFilter(req, res, next) {
		if(req.isAuthenticated()) {
			next();
		} else {
			res.redirect('/');
		}
	}

	router.get('/', function(req, res, next) {
		res.render('index', {"title": "AnonChat - Vendetta's Chat Engine"});
	});

	router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/chatrooms',
		failureRedirect: '/'
	}));

	router.get('/chatrooms', authFilter, function(req, res, next) {
		res.render('chatrooms', {
			"title": "Chatrooms | AnonChat - Vendetta's Chat Engine", 
			user: req.user, 
			config: config
		});
	});

	function getRoom(room_id, callback) {
		models.Room.findById(room_id, callback);
	}

	router.get('/room/:id', authFilter, function(req, res, next) {
		getRoom(req.params.id, function() {
			res.render('room', { user: req.user, room_number:req.params.id, room_name: room.room_name, config:config });
		});
	});

	router.get('/logout', function(req, res, next) {
		req.logout();
		res.redirect("/");
	});

	app.use('/', router);
}