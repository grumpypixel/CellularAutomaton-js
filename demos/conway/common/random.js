/* random.js */

class Random {
	static randomMinMax(min, max) {
		return (Math.random() * (max - min)) + min;
	}
}
