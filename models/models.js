module.exports = function(mongoose) {
	return {
		User: function () {
			var userSchema = mongoose.Schema({
				profileID: String,
				fullName: String,
				email: String,
				profilePic: String,
				subscription_endpoint: String,
				notifications: Array
			});
			userSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
			  return this.collection.findAndModify(query, sort, doc, options, callback);
			};
			return mongoose.model("users", userSchema);
		}(),
		Room: function() {
			var roomSchema = mongoose.Schema({
				room_name: String,
				users: Array,
				messages: Array
			});
			roomSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
			  return this.collection.findAndModify(query, sort, doc, options, callback);
			};
			return mongoose.model("rooms", roomSchema);
		}(),
		Message: function() {
			var messageSchema = mongoose.Schema({
				message: String,
				user_id: String,
				room_id: String
			});
			messageSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
			  return this.collection.findAndModify(query, sort, doc, options, callback);
			};
			return mongoose.model("messages", messageSchema);
		}()
	};
}