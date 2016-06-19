module.exports = function(io, models, utils) {
	var Room = models.Room;
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
			// remove multiple sessions of same user to prevent repetition in list
			users_list = utils.unique(users_list, function(user1, user2) {
				return user1.name > user2.name;
			});

			socket.broadcast.to(data.room_number).emit("new_user", JSON.stringify(users_list));
			socket.to(data.room_number).emit("new_user", JSON.stringify(users_list));
			
			Room.findById(data.room_number, function(err, room) {
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
							profile_pic: data.profile_pic
						}
					}
				}, {
					safe: true,
					upsert: true
				},
				function(err, room) {
					if (!err && room) {
						socket.broadcast.to(data.room_number).emit("new_message", JSON.stringify(data));
					} else {
						socket.to(data.room_number).emit("error", {
							"type": "new_message",
							"message": "Unable to send message"
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