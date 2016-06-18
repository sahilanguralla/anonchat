(function() {
	var
		eventSupport = ('querySelector' in document && 'addEventListener' in window)
	jsonSupport = (typeof JSON !== 'undefined'),
		jQuery = (eventSupport && jsonSupport) ? 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js' : '/js/library/jquery.legacy.min.js';
	document.write('<script src="' + jQuery + '"><\/script>');
}());