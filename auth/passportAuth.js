module.exports = function(passport, FacebookStrategy, config, mongoose) {
	// Schema designing
	var userSchema = mongoose.Schema({
		profileID: String,
		fullName: String,
		email: String,
		profilePic: String
	});
	var User = mongoose.model("users", userSchema);

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done) {
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