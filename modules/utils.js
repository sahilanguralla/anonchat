module.exports = {
	unique: function(a, compareFunc) {
		a.sort(compareFunc);
		for (var i = 1; i < a.length;) {
			if (compareFunc(a[i - 1], a[i]) == 0) {
				a.splice(i, 1);
			} else {
				i++;
			}
		}
		return a;
	}
};