module.exports = function(mongoose) {
	return {
		User: function () {
			var userSchema = mongoose.Schema({
				profileID: String,
				fullName: String,
				email: String,
				profilePic: String
			});
			return mongoose.model("users", userSchema);
		}(),
		Room: function() {
			var roomSchema = mongoose.Schema({
				room_name: String,
				users: Array,
				messages: Array
			});
			return mongoose.model("rooms", roomSchema);
		}(),
		Message: function() {
			var messageSchema = mongoose.Schema({
				message: String,
				user_id: String,
				room_id: String
			});
			return mongoose.model("messages", messageSchema);
		}()
	};
}