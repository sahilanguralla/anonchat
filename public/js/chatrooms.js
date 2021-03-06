$(function() {
  var socket = io.connect(host + '/roomlist');

  socket.on('connect', function() {
    console.log('Connected to Server');
  });

  $("#create").on("click", function() {
    var room_name = $('#room-name');
    if ('' != room_name) {
      socket.emit("new_room", {
        room_name: room_name.val()
      });
      room_name.val("");
    }
  });
  $("#room-name").keydown(function(e) {
    if ("Enter" == e.key) {
      $('#create').click();
    }
  });

  socket.on("room_update", function(data) {
    var rooms = JSON.parse(data);
    console.log("Rooms received:", data);
    $("#room-list").empty();
    $.each(rooms, function() {
      var room = $('<div class="item"><i class="ui avatar image comments outline icon"></i><div class="content"><a class="header"></a></div></div>');
      var holder = room.find("a");
      holder.attr("href", 'room/' + this._id);
      holder.text(this.room_name);
      $("#room-list").prepend(room);
    });
  })
});