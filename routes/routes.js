module.exports = function(express, app, passport, config, rooms) {
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

	function getRoomName(room_number) {
		for(var i = 0; i < rooms.length; i++) {
			if(rooms[i].room_number == room_number) {
				return rooms[i].room_name;
			}
		}
	}

	router.get('/room/:id', authFilter, function(req, res, next) {
		var room_name = getRoomName(req.params.id);
		res.render('room', { user: req.user, room_number:req.params.id, room_name: room_name, config:config });
	});

	router.get('/logout', function(req, res, next) {
		req.logout();
		res.redirect("/");
	});

	app.use('/', router);
}