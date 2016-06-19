module.exports = function(io, models) {
	var chatrooms = io.of('/roomlist').on('connection', function(socket) {
		console.log('Socket Connection established on Server Side!');
		var Room = models.Room;
		Room.find().sort({id: -1}).exec(function(rooms) {
			socket.emit('room_update', JSON.stringify(rooms));
		});
		socket.on('new_room', function(data) {
			new Room({
				room_name: data.room_name
			}).save(function() {
				Room.find().sort({id: -1}).exec(function(rooms) {
					socket.broadcast.emit('room_update', JSON.stringify(rooms));
					socket.emit('room_update', JSON.stringify(rooms));
				});
			});
		});
	});
	var messages = io.of('/messages').on('connection', function(socket) {
		console.log('Socket Connection established on Server Side!');
		socket.on('join_room', function(data) {
			socket.username = data.username;
			socket.profile_pic = data.profile_pic;
			socket.join(data.room_number);
			
			// broadcast the updated list to all joined users
			var get_users = io.of('/messages').clients(data.room_number);
			var users_list = [];
			for(var i in get_users) {
				users_list.push({username: get_users[i].username, profile_pic: get_users[i].profile_pic});
			}
			socket.broadcast.to(data.room_number).emit("new_user", JSON.stringify(users_list));
			socket.to(data.room_number).emit("new_user", JSON.stringify(users_list));
		});
		socket.on('new_message', function(data) {
			socket.broadcast.to(data.room_number).emit("new_message", JSON.stringify(data));
		});
	});
}