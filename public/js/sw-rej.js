$(function() {

	var isPushEnabled = false;
	// Registering Service Worker
	var pushButton = $('#push-notification-toggler');
	pushButton.click(function() {
		console.log("button clicked and isPushEnabled", isPushEnabled);
		if (isPushEnabled) {
			unsubscribe();
		} else {
			subscribe();
		}
	});

	// Check that service workers are supported, if so, progressively  
	// enhance and add push messaging support, otherwise continue without it.  
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('../sw.js')
			.then(initialiseState);
	} else {
		console.warn('Service workers aren\'t supported in this browser.');
	}

	// Once the service worker is registered set the initial state  
	function initialiseState() {
		// Are Notifications supported in the service worker?  
		if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
			console.warn('Notifications aren\'t supported.');
			return;
		}

		// Check the current Notification permission.  
		// If its denied, it's a permanent block until the  
		// user changes the permission  
		if (Notification.permission === 'denied') {
			console.warn('The user has blocked notifications.');
			return;
		}

		// Check if push messaging is supported  
		if (!('PushManager' in window)) {
			console.warn('Push messaging isn\'t supported.');
			return;
		}

		// We need the service worker registration to check for a subscription  
		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
			// Do we already have a push message subscription?  
			serviceWorkerRegistration.pushManager.getSubscription()
				.then(function(subscription) {
					// Enable any UI which subscribes / unsubscribes from  
					// push messages.  
					// var pushButton = $('#push-notification-toggler');
					// pushButton.disabled = false;

					if (!subscription) {
						// We aren't subscribed to push, so set UI  
						// to allow the user to enable push  
						return;
					}

					// Keep your server in sync with the latest subscriptionId
					sendSubscriptionToServer(subscription).then();

					// Set your UI to show they have subscribed for  
					// push messages  
					// pushButton.textContent = 'Disable Push Messages';
					pushButton.state('activate');
					isPushEnabled = true;
				})
				.catch(function(err) {
					console.warn('Error during getSubscription()', err);
				});
		});
	}

	function subscribe() {
		console.log("started subscribing", isPushEnabled);
		// Disable the button so it can't be changed while  
		// we process the permission request  
		// var pushButton = $('#push-notification-toggler');
		// pushButton.disabled = true;

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
			serviceWorkerRegistration.pushManager.subscribe({
					userVisibleOnly: true
				})
				.then(function(subscription) {
					// The subscription was successful  
					isPushEnabled = true;
					// pushButton.textContent = 'Disable Push Messages';
					// pushButton.disabled = false;
					console.log("done subscribing", subscription);;
					// TODO: Send the subscription.endpoint to your server  
					// and save it to send a push message at a later date
					return sendSubscriptionToServer(subscription);
				})
				.catch(function(e) {
					pushButton.state().toggle();
					if (Notification.permission === 'denied') {
						// The user denied the notification permission which  
						// means we failed to subscribe and the user will need  
						// to manually change the notification permission to  
						// subscribe to push messages  
						console.warn('Permission for Notifications was denied');
					} else {
						// A problem occurred with the subscription; common reasons  
						// include network errors, and lacking gcm_sender_id and/or  
						// gcm_user_visible_only in the manifest.  
						console.error('Unable to subscribe to push.', e);
						// pushButton.disabled = false;
						// pushButton.textContent = 'Enable Push Messages';
					}
				});
		});
	}

	function unsubscribe() {
		console.log("started unsubscribing", isPushEnabled);
		var pushButton = document.querySelector('#push-notification-toggler');
		// pushButton.disabled = true;

		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
			// To unsubscribe from push messaging, you need get the  
			// subscription object, which you can call unsubscribe() on.  
			serviceWorkerRegistration.pushManager.getSubscription().then(
				function(pushSubscription) {
					// Check we have a subscription to unsubscribe  
					console.log("pushSubscription", pushSubscription);
					if (!pushSubscription) {
						// No subscription object, so set the state  
						// to allow the user to subscribe to push  
						isPushEnabled = false;
						// pushButton.disabled = false;
						// pushButton.textContent = 'Enable Push Messages';
						return;
					}

					var subscriptionId = pushSubscription.subscriptionId;
					sendUnsubscriptionToServer(pushSubscription);

					// We have a subscription, so call unsubscribe on it  
					pushSubscription.unsubscribe().then(function(successful) {
						// pushButton.disabled = false;
						// pushButton.textContent = 'Enable Push Messages';
						isPushEnabled = false;
					}).catch(function(e) {
						// We failed to unsubscribe, this can lead to  
						// an unusual state, so may be best to remove
						// the users data from your data store and
						// inform the user that you have done so

						console.log('Unsubscription error: ', e);
						// pushButton.disabled = false;
						// pushButton.textContent = 'Enable Push Messages';
					});
				}).catch(function(e) {
				console.error('Error thrown while unsubscribing from push messaging.', e);
			});
		});
	}

	function sendSubscriptionToServer(subscription) {
		console.log("sending subscription to server", subscription);
		return new Promise(function(resolve, reject) {
			// do a thing, possibly async, then…

			var sub_url = subscription.endpoint.split('/');
			var subscription_endpoint = sub_url[sub_url.length - 1];
			$.post('/subscribe', {
					user_id: user_id,
					subscription_endpoint: subscription_endpoint
			}).done(function(response) {
				resolve(response);
			}).fail(function(response) {
				reject(response);
			});
		});
	}

	function sendUnsubscriptionToServer(subscription) {
		return new Promise(function(resolve, reject) {
			// do a thing, possibly async, then…
			
			var sub_url = subscription.endpoint.split('/');
			var subscription_endpoint = sub_url[sub_url.length - 1];

			$.post('/unsubscribe', {
					user_id: user_id,
					subscription_endpoint: subscription_endpoint
			}).done(function(response) {
				resolve(response.data);
			}).fail(function(response) {
				reject(response.error);
			});

		});
	}
});