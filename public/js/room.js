$(function() {
  var messages = io.connect(host + "/messages");

  messages.on("connect", function() {
    console.log('Connected to Server');
    messages.emit('join_room', {
      room_number: roomNumber,
      username: username,
      profile_pic: profilePic
    });
  });

  $("#message-input").keydown(function(e) {
    if ("Enter" == e.key && "" != this.value) {
      messages.emit('new_message', {
        room_number: roomNumber,
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
    updateMessageFeed(data.username, data.profile_pic, data.message);
  });

  messages.on("new_user", function(data) {
    var data = JSON.parse(data);
    $("#user-feed").empty();
    for (var i in data) {
      var str = updateUserFeed(data[i].username, data[i].profile_pic);
      $('#user-feed').prepend(str).hide().slideDown(100);
    }
  })

  $(document)
    .ready(function() {
      var $toggle = $('.ui.toggle.button');
      $toggle
        .state({
          text: {
            inactive: $toggle.data('inactive'),
            active: $toggle.data('active')
          }
        });

    });

  // Registering Service Worker
  var pushButton = $('push-notification-toggler');
  pushButton.click(function() {
    if (isPushEnabled) {
      unsubscribe();
    } else {
      subscribe();
    }
  });

  // Check that service workers are supported, if so, progressively  
  // enhance and add push messaging support, otherwise continue without it.  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../js/sw.js')
      .then(initialiseState);
  } else {
    console.warn('Service workers aren\'t supported in this browser.');
  }
});