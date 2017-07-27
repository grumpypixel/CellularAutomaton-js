/* conway.js */

class Conway {
	constructor(width, height, wrap) {
		this.cellName = 'cell';
		this.world = this.__createCellularAutomaton(width, height, wrap);
	}

	getWidth() {
		return this.world.getWidth();
	}

	getHeight() {
		return this.world.getHeight();
	}

	getGeneration() {
		return this.world.getTime();
	}

	isCellAlive(x, y) {
		const cell = this.world.getCell(x, y);
		return (cell ? cell.alive : false);
	}

	toggleCell(x, y) {
		const cell = this.world.getCell(x, y);
		if (cell) {
			const alive = cell.alive;
			cell.alive = !alive;
		}
	}

	randomize(threshold = 0.5) {
		this.world.initialize();
		const width = this.getWidth();
		const height = this.getHeight();
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				this.world.getCell(x, y).randomize(threshold);
			}
		}
	}

	testGrid() {
		// const grid = this.world.makeGridFromValues(0, [
		//   { cellType: this.cellName, callback: function(x, y, cell) {
		//       return (cell && cell['alive'] === true ? 1 : 0);
		//     }
		//   }]);
		// this.world.createFromGridValues(grid, [
		//   { value: 0, cellType: this.cellName, callback: function(cell) { cell.alive = false; } },
		//   { value: 1, cellType: this.cellName, callback: function(cell) { cell.alive = true; } }
		// ]);
		//
		// this.world.getCell(3, 4).alive = true;
		// this.world.getCell(4, 4).alive = true;
		// this.world.getCell(6, 4).alive = true;
		// this.world.getCell(7, 4).alive = true;
		//
		// this.world.getCell(3, 5).alive = true;
		// this.world.getCell(4, 5).alive = true;
		// this.world.getCell(6, 5).alive = true;
		// this.world.getCell(7, 5).alive = true;
		//
		// this.world.getCell(5, 6).alive = true;

		this.world.getCell(0, 4).alive = true;
		this.world.getCell(1, 4).alive = true;
		this.world.getCell(3, 4).alive = true;
		this.world.getCell(4, 4).alive = true;

		this.world.getCell(0, 5).alive = true;
		this.world.getCell(1, 5).alive = true;
		this.world.getCell(3, 5).alive = true;
		this.world.getCell(4, 5).alive = true;

		this.world.getCell(2, 6).alive = true;
	}

	simulate() {
		this.world.simulate();
	}

	__createCellularAutomaton(width, height, wrap) {
		const config = {
			width: width,
			height: height,
			wrap: wrap,
			neighborhood: this.__getMooreNeighborhood(),
		}
		const world = new CellularAutomaton(config);
		this.__registerCellType(world);
		world.createWithDistribution([{ cellType: this.cellName, ratio: 1 }]);
		return world;
	}

	__registerCellType(world) {
		class Cell extends CellBehavior {
			constructor() {
				super();
			}
			initialize(context) {
				this.alive = this.wasAlive = false;
			}
			preProcess() {
				this.wasAlive = this.alive;
			}
			process(context) {
				const count = context.world.countNeighborsWithPropertyValue(context.x, context.y, 'wasAlive', true);
				this.alive = this.alive && count === 2 || count === 3;
			}
			randomize(threshold) {
				this.alive = Math.random() < threshold;
			}
		}
		world.registerCellType(this.cellName, Cell);
	}

	__getMooreNeighborhood() {
		return [
			{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
			{ x: -1, y:  0 }, { x: 1, y:  0 },
			{ x: -1, y:  1 }, { x: 0, y:  1 }, { x: 1, y:  1 }
		];
	}
}
