$(function() {
  var messages = io.connect(host + "/messages");

  messages.on("connect", function() {
    console.log('Connected to Server');
    messages.emit('join_room', {
      room_number: roomNumber,
      user_id: user_id,
      username: username,
      profile_pic: profilePic
    });
  });

  $("#message-input").keydown(function(e) {
    if ("Enter" == e.key && "" != this.value) {
      messages.emit('new_message', {
        room_number: roomNumber,
        user_id: user_id,
        message: this.value,
        username: username,
        profile_pic: profilePic
      });
      updateMessageFeed(username, profilePic, this.value, true);
      this.value = "";
    }
  })

  function updateMessageFeed(username, profilePic, message, you) {
    if ("undefined" == typeof you) {
      you = false;
    }
    if (you) {
      var pos = "left";
    } else {
      var pos = "right";
    }
    var str = '<div class="ui chat-message ' + pos + ' aligned ' + pos + ' floated ten wide column"><div class="ui comments"><div class="comment ' + pos + ' aligned ' + pos + ' floated ui grid"><div class="' + pos + ' floated three wide column"><a class="avatar"><img src="' + profilePic + '"></a></div><div class="thirteen wide column"><div class="content"><a class="author">' + $("<div>").text(username).html() + '</a><div class="metadata"><div class="date"><!--2 days ago--></div></div><div class="text">' + $("<div>").text(message).html() + '</div></div></div></div></div></div>';
    $('#message-feed').prepend(str).hide().slideDown(100);
  }

  function updateUserFeed(username, profilePic) {
    var str = '<div class="ui vertical segment"><img class="ui avatar image" src="' + profilePic + '">' + username + '</div>';
    return str;
  }

  messages.on("new_message", function(data) {
    var data = JSON.parse(data);
    data.forEach(function(message_obj) {
      updateMessageFeed(message_obj.username, message_obj.profile_pic, message_obj.message);
    })
  });

  messages.on("new_user", function(data) {
    var data = JSON.parse(data);
    $("#user-feed").empty();
    for (var i in data) {
      var str = updateUserFeed(data[i].username, data[i].profile_pic);
      $('#user-feed').prepend(str).hide().slideDown(100);
    }
  })

  var $toggle = $('.ui.toggle.button');
  $toggle
    .state({
      text: {
        inactive: $toggle.data('inactive'),
        active: $toggle.data('active')
      }
    });

});