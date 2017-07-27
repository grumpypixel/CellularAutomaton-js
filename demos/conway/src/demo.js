/* demo.js */

const rasterWidth = 128;
const rasterHeight = 128;
const pixelSize = 4;
const padding = 1;
const wrap = true;

let rasterMatrix = null;
let conway = null;
let timer = new Time();
let cyclicColor = 0;

window.onload = function() {
	const canvas = getCanvas();
	canvas.style.backgroundColor = 'rgba(64, 64, 96, 128)';
	canvas.addEventListener("mousedown", onMouseDown, false);

	rasterMatrix = createRasterMatrix(rasterWidth, rasterHeight);
	rasterMatrix.centerInRect({ x: 0, y :0, width: canvas.width, height: canvas.height });

	conway = new Conway(rasterWidth, rasterHeight, wrap);
	conway.randomize(0.5);

	window.requestAnimationFrame(updateFrame);
}

function createRasterMatrix(width, height) {
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

function updateFrame() {
	let canvas = getCanvas();
	let context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	timer.update();
	cyclicColor += 10 * timer.deltaTime;

	conway.simulate();
	renderCells(context);

	CanvasRenderer.drawText(context, 10, 25, conway.getGeneration(), '#ff0', 'left', 'bold 20px Courier');
	CanvasRenderer.drawText(context, canvas.width-10, 25, (timer.deltaTime * 1000).toFixed(2), '#f0f', 'right', 'bold 20px Courier');

	window.requestAnimationFrame(updateFrame);
}

function renderCells(context) {
	const cellColor = 'hsl(' + cyclicColor + ', 100%, 50%)';
	const width = conway.getWidth();
	const height = conway.getHeight();
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			rasterMatrix.setPixel(x, y, conway.isCellAlive(x, y) ? cellColor : '#333');
		}
	}
	rasterMatrix.render(context, null);
}

function getCanvas() {
	return document.getElementById('canvas');
}

function onMouseDown(event) {
  const threshold = Random.randomMinMax(0.3, 0.75);
  conway.randomize(threshold);
}
