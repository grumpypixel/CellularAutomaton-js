/* random.js */

class Random {
	static randomMinMax(min, max) {
		return (Math.random() * (max - min)) + min;
	}

	static randomItem(items) {
		return (items.length > 0 ? items[Math.floor(Math.random(0, items.length-1))] : null);
	}
}
