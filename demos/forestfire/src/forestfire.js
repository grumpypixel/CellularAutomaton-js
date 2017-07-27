/* forestfire.js */

class ForestFire {
	constructor(width, height, wrap) {
		this.cellName = 'tree';
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

	getGrowthState(x, y) {
		return this.world.getCell(x, y).growth;
	}

	getFireState(x, y) {
		return this.world.getCell(x, y).fire;
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
		class Tree extends CellBehavior {
			constructor() {
				super();
			}
			initialize(context) {
				this.growth = 0;
				this.fire = 0;
			}
			randomize(threshold) {
				const max = 10;
				if (Math.random() < threshold) {
					this.growth = Math.trunc(Random.randomMinMax(1, max));
				} else {
					this.growth = 0;
				}
			}
			preProcess() {
				this.prevGrowth = this.growth;
				this.prevFire = this.fire;
			}
			process(context) {
				if (this.prevFire > 0) {
					this.handleFire(context);
				} else {
					this.handleGrowth(context);
				}
			}
			handleGrowth(context) {
				const max = 10;
				if (this.prevGrowth === 0) {
					if (Math.random() < 0.001) {
						this.growth = 1;
					}
				} else {
					this.growth += 1;
				}
				if (this.prevGrowth >= max) {
					if (Math.random() < 0.001) {
						const neighbors = context.world.getNeighborsWithPropertyValue(context.x, context.y, 'growth', 0);
						const neighbor = Random.randomItem(neighbors);
						if (neighbor !== null) {
							neighbor.growth = 1;
						}
					}
				}
				if (this.prevGrowth > 0 && Math.random() < 0.00001) {
					this.setOnFire();
				}
			}
			handleFire(context) {
				const max = 10;
				if (this.prevFire < max) {
					this.fire += 1;
					if (this.prevFire > 3) {
						if (Math.random() < this.prevFire / max) {
							const neighbors = this.getFireCandidates(context);
							const neighbor = Random.randomItem(neighbors);
							if (neighbor !== null) {
								neighbor.setOnFire();
							}
						}
					}
				} else {
					this.fire = 0;
					this.growth = 0;
				}
			}
			setOnFire() {
				this.fire = 1;
			}
			getFireCandidates(context) {
				let neighbors = [];
				const count = context.neighborhood.length;
				for (let i = 0; i < count; ++i) {
					const offset = context.neighborhood[i];
					const neighbor = context.world.getCell(context.x + offset.x, context.y + offset.y);
					if (neighbor && neighbor.fire === 0 && neighbor.growth > 0) {
						neighbors.push(neighbor);
					}
				}
				return neighbors;
			}
		}
		world.registerCellType(this.cellName, Tree);
	}

	__getMooreNeighborhood() {
		return [
			{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
			{ x: -1, y:  0 }, { x: 1, y:  0 },
			{ x: -1, y:  1 }, { x: 0, y:  1 }, { x: 1, y:  1 }
		];
	}
}
