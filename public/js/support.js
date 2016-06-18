(function() {
	var
		eventSupport = ('querySelector' in document && 'addEventListener' in window)
	jsonSupport = (typeof JSON !== 'undefined'),
		jQuery = (eventSupport && jsonSupport) ? '/js/library/jquery.min.js' : '/js/library/jquery.legacy.min.js';
	document.write('<script src="' + jQuery + '"><\/script>');
}());