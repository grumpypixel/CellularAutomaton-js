/* demo.js */

const raster = {
	width: 128,
	height: 128,
	pixelSize: 4,
	padding: 1
};

const wrapWorld = true;

let rasterMatrix = null;
let forestFire = null;
let timer = new Time();
let treeColorPalette = null;
let fireColorPalette = null;

window.onload = function() {
	const canvas = getCanvas();
	canvas.style.backgroundColor = 'rgba(0, 64, 0, 1)';
	canvas.addEventListener("mousedown", onMouseDown, false);

	rasterMatrix = createRasterMatrix(raster.width, raster.height, raster.pixelSize, raster.padding);
	rasterMatrix.centerInRect({ x: 0, y :0, width: canvas.width, height: canvas.height });

	forestFire = new ForestFire(raster.width, raster.height, wrapWorld);
	forestFire.randomize(0.1);

	createColorPalettes();

	timer.start();
	window.requestAnimationFrame(updateFrame);
}

function createRasterMatrix(width, height, pixelSize, padding) {
	const config = {
		width: width,
		height: height,
		pixelSize: { x: pixelSize, y: pixelSize },
		margin: { x: 0, y: 0 },
		padding: { x: padding, y: padding },
		topLeftOffset: { x: 0, y: 0 },
	}
	return new RasterMatrix(config);
}

function createColorPalettes() {
	const soilColor = '#303000';
	const treePalette = createColorPalette('#7cfc00', '#228B22', 10);
	treeColorPalette = [soilColor].concat(treePalette);

	const firePalette = createColorPalette('#ffff00', '#ff0000', 10);
	fireColorPalette = [soilColor].concat(firePalette);
}

function updateFrame() {
	let canvas = getCanvas();
	let context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	timer.update();
	forestFire.simulate();
	renderForestFire(context);

	CanvasRenderer.drawText(context, 10, 25, forestFire.getGeneration(), '#ff0', 'left', 'bold 20px Courier');
	// CanvasRenderer.drawText(context, canvas.width-10, 25, (timer.deltaTime * 1000).toFixed(2), '#f0f', 'right', 'bold 20px Courier');

	window.requestAnimationFrame(updateFrame);
}

function renderForestFire(context) {
	const width = forestFire.getWidth();
	const height = forestFire.getHeight();
	const max = treeColorPalette.length - 1;
	let color = null;

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			const fire = Math.min(max, forestFire.getFireState(x, y));
			if (fire > 0) {
				color = fireColorPalette[fire];
			} else {
				const growth = Math.min(max, forestFire.getGrowthState(x, y));
				color = treeColorPalette[growth];
			}
			rasterMatrix.setPixel(x, y, color);
		}
	}
	rasterMatrix.render(context, null);
}

function getCanvas() {
	return document.getElementById('canvas');
}

function onMouseDown(event) {
	const threshold = Random.randomMinMax(0.01, 0.1);
	forestFire.randomize(threshold);
}

function createColorPalette(color1, color2, count) {
	let palette = [];
	const step = 1.0 / (count - 1);
	for (let i = 0; i < count; ++i) {
		const color = lerpColor(color1, color2, i * step);
		palette.push(color);
	}
	return palette;
}

// rosszurowski/lerp-color.js
// Source: https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
function lerpColor(a, b, amount) {
	const ah = parseInt(a.replace(/#/g, ''), 16),
		ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ''), 16),
		br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab);
	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}
