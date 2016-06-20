module.exports = function(io, mongoose, gcm, models, utils, config) {
	var Room = models.Room;
	var User = models.User;
	var chatrooms = io.of('/roomlist').on('connection', function(socket) {
		console.log('Socket Connection established on Server Side!');
		Room.find({}).sort({
			id: -1
		}).exec(function(err, rooms) {
			console.log("emmiting back all rooms", rooms);
			socket.emit('room_update', JSON.stringify(rooms));
		});
		socket.on('new_room', function(data) {
			new Room({
				room_name: data.room_name
			}).save(function() {
				Room.find({}).sort({
					id: -1
				}).exec(function(err, rooms) {
					console.log("found rooms to be sent via socket", rooms);
					socket.broadcast.emit('room_update', JSON.stringify(rooms));
					socket.emit('room_update', JSON.stringify(rooms));
				});
			});
		});
	});
	var messages = io.of('/messages').on('connection', function(socket) {
		console.log('Socket Connection established on Server Side!');
		socket.on('join_room', function(data) {

			//if user isn't already member
			socket.user_id = data.user_id;
			socket.username = data.username;
			socket.profile_pic = data.profile_pic;
			socket.join(data.room_number);

			// broadcast the updated list to all joined users
			get_users = io.of('/messages').clients(data.room_number);


			var users_list = [];
			for (var i in get_users) {
				users_list.push({
					user_id: get_users[i].user_id,
					username: get_users[i].username,
					profile_pic: get_users[i].profile_pic
				});
			}


			console.log("users_list before uniquing", users_list);
			// remove multiple sessions of same user to prevent repetition in list
			users_list = utils.unique(users_list, function(user1, user2) {
				return user1.user_id == user2.user_id ? 0 : (user1.user_id > user2.user_id);
			});

			console.log("users_list after uniquing", users_list);

			socket.broadcast.to(data.room_number).emit("new_user", JSON.stringify(users_list));
			socket.to(data.room_number).emit("new_user", JSON.stringify(users_list));

			// pushing joined members to database
			Room.findByIdAndUpdate(
				data.room_number, {
					$push: {
						"users": {
							user_id: data.user_id,
							username: data.username,
							profile_pic: data.profile_pic,
						}
					}
				}, {
					safe: true,
					upsert: true
				},
				function(err, room) {
					console.log("Room found:", room);
					if(!err)
						socket.to(data.room_number).emit("new_message", JSON.stringify(room.messages));
				});
		});

		socket.on('new_message', function(data) {
			Room.findByIdAndUpdate(
				data.room_number, {
					$push: {
						"messages": {
							user_id: data.user_id,
							username: data.username,
							profile_pic: data.profile_pic,
							message: data.message
						}
					}
				}, {
					safe: true,
					upsert: true
				},
				function(err, room) {
					console.log("Pushed message to room": room);
					if (!err && room) {
						socket.broadcast.to(data.room_number).emit("new_message", JSON.stringify([data]));
						
						var users = [];
						room.users.forEach(function(user) {
							if(user.user_id == user_id) return;
							users.push(mongoose.Types.ObjectId(user.user_id));
						});

						User.update({
							$and: [{
								_id: {
									$in: users,
								}
							}, {
								subscription_endpoint: {
									$exists: true
								}
							}]
						}, {
							$push: {
								"notifications": {
									type: "new_message",
									data: data
								}
							}
						}, function(err, users) {
							console.log("Pushed message to subscribed users' notifications:": users);

							if(!err && users) {
								var regTokens = users.map(function(user) {
									return user.subscription_endpoint;
								});
 
								var message = new gcm.Message({
								    data: data
								});
								 
								// Set up the sender with you API key, prepare your recipients' registration tokens. 
								var sender = new gcm.Sender(config.gcm.api_key);
								 
								sender.send(message, { registrationTokens: regTokens }, function (err, response) {
									if(err) console.error(err);
									else console.log(response);
								});
							}
						});
					} else {
						socket.to(data.room_number).emit("error", {
							"type": "new_message",
							"message": "Unable to send message. This might be due to invalid room."
						});
					}

				}
			)
		});
	});
}

// Room.findByIdAndUpdate(
// 	data.room_number,
// 	{$push: {"users": {id: data.user_id, username: data.username, profile_pic: data.profile_pic }}},
// 	{safe: true, upsert: true},
// 	function(err, room) {