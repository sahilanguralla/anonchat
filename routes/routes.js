module.exports = function(express, app, passport, config, models) {
	var router = express.Router();

	function authFilter(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			res.redirect('/');
		}
	}

	router.get('/', function(req, res, next) {
		res.render('index', {
			"title": "AnonChat - Vendetta's Chat Engine"
		});
	});

	router.get('/auth/facebook', passport.authenticate('facebook', {
		scope: ['email']
	}));
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

	router.get('/room/:id', authFilter, function(req, res, next) {
		models.Room.findById(req.params.id, function(err, room) {
			if (err || !room) {
				res.redirect('/chatrooms');
			} else {
				res.render('room', {
					user: req.user,
					room_number: req.params.id,
					room_name: room.room_name,
					config: config
				});
			}
		});
	});

	router.post('/subscribe', function(req, res, next) {
		console.log("subscribe request body", req.body);
		var data = req.body;
		models.User.findByIdAndUpdate(data.user_id, {
			$set: {subscription_endpoint: data.subscription_endpoint}
		}, {
			safe: true,
			upsert: true
		}, function(err, subscription) {
			if (err) next(err);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(subscription));
		});
	});

	router.post('/unsubscribe', function(req, res, next) {
		console.log("unsubscribe request body", req.body);
		var data = req.body;
		models.User.findOneAndUpdate({
				$and: [{
					id: data.user_id
				}, {
					subscription_endpoint: data.subscription_endpoint
				}]
			}, {
				$unset: {
					subscription_endpoint: 1
					notifications: 1
				}
			}, {
				safe: true,
				upsert: true
			},
			function(err, subscription) {
				if (err) next(err);
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					message: "Successfully unsubscribed!"
				}));
			});
	});

	router.get('/notifications/:subscription_endpoint', function(req, res, next) {
		console.log("started fetching notifications for user", req.body);
		var data = req.params;
		models.User.findOne({subscription_endpoint: data.subscription_endpoint}, function(err, user) {
			if (err) next(err);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({
				notifications: user.notifications
			}));
			user.update({
				$unset: {
					notifications: 1
				}
			});
		});
	});

	router.get('/logout', function(req, res, next) {
		req.logout();
		res.redirect("/");
	});

	app.use('/', router);
}