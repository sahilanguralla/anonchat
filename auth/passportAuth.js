module.exports = function(passport, FacebookStrategy, config, models) {
	var User = models.User;

	// User storage in session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// User identification from session
	passport.deserializeUser(function(id, done) {
		console.log(User);
		User.findById(id, function(err, user) {
			done(null, user);
		});
	});
	passport.use(new FacebookStrategy({
		clientID: config.fb.appID,
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields: ['id', 'displayName', 'emails', 'photos']
	}, function(accessToken, refreshToken, profile, done) {
		User.findOne({'profileID': profile.id}, function(err, res) {
			if(res) {
				done(null, res);
			} else {
				var user = new User({
					profileID: profile.id,
					fullName: profile.displayName,
					email: profile.email || '',
					profilePic: profile.photos[0].value || ''
				});

				user.save(function(err) {
					done(null, user);
				});

			}
		})
	}))
}