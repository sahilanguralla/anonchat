self.addEventListener('push', function(event) {
  // Since there is no payload data with the first version  
  // of push messages, we'll grab some data from  
  // an API and use it to populate a notification
  var notifications = {};
  console.log(event);
  event.waitUntil(
    registration.pushManager.getSubscription().then(function(subscription) {
      console.log("got subscription id: ", subscription.endpoint)
      fetch("/notifications", {
        method: "POST",
        body: JSON.stringify({
          subscription: subscription
        })
      }).then(function(response) {
        if (response.status !== 200) {
          // Either show a message to the user explaining the error  
          // or enter a generic message and handle the
          // onnotificationclick event to direct the user to a web page  
          console.log('Looks like there was a problem. Status Code: ' + response.status);
          throw new Error();
        }

        // Examine the text in the response  
        return response.json().then(function(data) {
          console.log("Notifications fetched from the server:", data);
          
          if (data.error || !data) {
            console.error('The API returned an error.', data.error);
            throw new Error();
          }

          notifications = data.data;
        }).then(function() {
          var promises = [];
          room_notifications.forEach(function(notification) {
            promises.push(self.registration.showNotification(notification.room_name, {
              body: notification.username + ": " + notification.message,
              icon: "",
              tag: notification.room_number
            }));
          })
          return Promise.all(promises);
        });


      }).catch(function(err) {
        console.error('Unable to retrieve data', err);

        var title = 'An error occurred';
        var message = 'We were unable to get the information for this push message';
        var icon = URL_TO_DEFAULT_ICON;
        var notificationTag = 'notification-error';
        return self.registration.showNotification(title, {
          body: message,
          icon: "https://tbt-anonchat.herokuapp.com/icons/icon-64x64.png",
          tag: notificationTag
        });
      })
    });

  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn't close the notification when you click on it  
  // See: http://crbug.com/463146  
  event.notification.close();

  // This looks to see if the current is already open and  
  // focuses if it is  
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url == '/chatrooms' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/chatrooms');
      }
    })
  );
});