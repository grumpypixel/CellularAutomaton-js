/* cellularautomaton.js */

class CellBehavior {
	constructor() {}
	initialize(context) {}
	preProcess() {}
	process(context) {}
}

class CellularAutomaton {
	constructor(config) {
		this.width = Math.max(0, Math.floor(config.width));
		this.height = Math.max(0, Math.floor(config.height));
		this.wrap = config.wrap || false;
		this.neighborhood = config.neighborhood || this.getMooreNeighborhood();
		this.border = config.border || { top: null, right: null, bottom: null, left: null };
		this.randomizer = config.random01 || Math.random;

		this.time = 0;
		this.cells = this.__createCellArray(this.width, this.height);
		this.neighbors = new Array(this.neighborhood.length).fill().map( () => {
			return null;
		});
		this.cellTypes = {};
		this.context = {
			world: this,
			x: -1,
			y: -1,
			neighbors: this.neighbors,
			neighborhood: this.neighborhood,
		}
	}

	registerCellType(cellType, behavior) {
		this.cellTypes[cellType] = behavior;
	}

	deregisterCellType(cellType) {
		if (this.cellTypes[cellType]) {
			delete this.cellTypes[cellType];
		}
	}

	createWithDistribution(distribution) {
		if (!distribution || distribution.length === 0) {
			return;
		}
		let sum = 0.0;
		for (let i = 0; i < distribution.length; ++i) {
			sum += distribution[i].ratio;
		}
		for (let i = 0; i < distribution.length; ++i) {
			distribution[i].ratio /= sum;
		}
		for (let i = 1; i < distribution.length; ++i) {
			distribution[i].ratio += distribution[i-1].ratio;
		}
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				const random = this.randomizer();
				for (let i = 0; i < distribution.length; ++i) {
					if (random <= distribution[i].ratio) {
						this.cells[x][y] = this.__createCellFromCellType(distribution[i].cellType);
						break;
					}
				}
			}
		}
		this.initialize();
	}

	// values = { value: 0, cellType: 'myCellType', callback: function(cell) { /* do something with the cell's state */ } }
	createFromGridValues(grid, values) {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				let cell = null;
				for (let i = 0; i < values.length; ++i) {
					if (values[i].value === grid[x][y]) {
						cell = this.__createCellFromCellType(values[i].cellType);
						if (values[i].callback) {
							values[i].callback(cell);
						}
						break;
					}
				}
				this.cells[x][y] = cell;
			}
		}
	}

	initialize() {
		this.time = 0;
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				this.context.x = x;
				this.context.y = y;
				this.cells[x][y].initialize(this.context);
			}
		}
	}

	clear() {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				this.cells[x][y] = null;
			}
		}
		this.cellTypes = {};
		this.time = 0;
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getTime() {
		return this.time;
	}

	getCell(x, y) {
		if (this.wrap === false) {
			/* Petri Dish edges */
			if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
				if (x < 0) {
					return this.border.left;
				} else if (x >= this.width) {
					return this.border.right;
				}
				if (y < 0) {
					return this.border.bottom;
				} else if (y >= this.height) {
					return this.border.top;
				}
			}
		} else {
			/* Torodial edges */
			if (x < 0 || x >= this.width) {
				x = x % this.width;
				if (x < 0) {
					x = this.width + x;
				}
			}
			if (y < 0 || y >= this.height) {
				y = y % this.height;
				if (y < 0) {
					y = this.height + y;
				}
			}
		}
		return this.cells[x][y];
	}

	getNeighbors(x, y) {
		let neighbors = [];
		const count = this.neighborhood.length;
		for (let i = 0; i < count; ++i) {
			const offset = this.neighborhood[i];
			neighbors.push(this.getCell(x + offset.x, y + offset.y));
		}
		return neighbors;
	}

	getNeighborsWithPropertyValue(x, y, property, value) {
		let neighbors = [];
		const count = this.neighborhood.length;
		for (let i = 0; i < count; ++i) {
			const offset = this.neighborhood[i];
			const neighbor = this.getCell(x + offset.x, y + offset.y);
			if (neighbor && neighbor[property] === value) {
				neighbors.push(neighbor);
			}
		}
		return neighbors;
	}

	sumPropertyValuesOfNeighbors(x, y, property) {
		const count = this.neighborhood.length;
		let sum = 0;
		for (let i = 0; i < count; ++i) {
			const offset = this.neighborhood[i];
			const neighbor = this.getCell(x + offset.x, y + offset.y);
			if (neighbor && neighbor[property]) {
				sum += neighbor[property];
			}
		}
		return sum;
	}

	getAveragePropertyValueOfNeighbors(x, y, property) {
		const count = this.neighborhood.length;
		let sum = 0;
		for (let i = 0; i < count; ++i) {
			const offset = this.neighborhood[i];
			const neighbor = this.getCell(x + offset.x, y + offset.y);
			if (neighbor && neighbor[property]) {
				sum += neighbor[property];
			}
		}
		return (count > 0 ? sum / count : 0);
	}

	countNeighborsWithPropertyValue(x, y, property, value) {
		let result = 0;
		const count = this.neighborhood.length;
		for (let i = 0; i < count; ++i) {
			const offset = this.neighborhood[i];
			const neighbor = this.getCell(x + offset.x, y + offset.y);
			if (neighbor && neighbor[property] === value) {
				result += 1;
			}
		}
		return result;
	}

	// values = { cellType: 'myType', hasProperty: 'myProp', gridValue: 1 }
	// makeGridFromValues(defaultValue, values) {
	//   const grid = this.__createCellArray(this.width, this.height);
	//   for (let y = 0; y < this.height; ++y) {
	//     for (let x = 0; x < this.width; ++x) {
	//       grid[x][y] = defaultValue;
	//       const cell = this.cells[x][y];
	//       if (cell === null) {
	//         continue;
	//       }
	//       const cellType = this.__getCellTypeForCell(cell);
	//       for (let i = 0; i < values.length; ++i) {
	//         if (values[i].cellType === cellType) {
	//           if (cell[values[i].hasProperty]) {
	//             grid[x][y] = values[i].gridValue;
	//             break;
	//           }
	//         }
	//       }
	//     }
	//   }
	//   return grid;
	// }

	// values = { cellType: 'myCellType', callback: function(x, y, cell) { return 0; } }
	makeGridFromValues(defaultValue, values) {
		const grid = this.__createCellArray(this.width, this.height);
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				grid[x][y] = defaultValue;
				const cell = this.cells[x][y];
				if (cell === null) {
					continue;
				}
				const cellType = this.__getCellTypeForCell(cell);
				for (let i = 0; i < values.length; ++i) {
					if (values[i].cellType === cellType) {
						if (values[i].callback) {
							grid[x][y] = values[i].callback(x, y, cell);
							break;
						}
					}
				}
			}
		}
		return grid;
	}

	simulate(steps = 1) {
		for (let s = 0; s < steps; ++s) {
			for (let y = 0; y < this.height; ++y) {
				for (let x = 0; x < this.width; ++x) {
					const cell = this.cells[x][y];
					if (cell) {
						cell.preProcess();
					}
				}
			}
			for (let y = 0; y < this.height; ++y) {
				for (let x = 0; x < this.width; ++x) {
					this.context.x = x;
					this.context.y = y;
					const cell = this.cells[x][y];
					if (cell) {
						cell.process(this.context);
					}
				}
			}
			this.time += 1;
		}
	}

	resetTime() {
		this.time = 0;
	}

	random01() {
		return this.randomizer();
	}

	randomMinMax(min, max) {
		return (this.randomizer() * (max - min)) + min;
	}

	__createCellArray(width, height) {
		return new Array(width).fill().map( () => {
			return new Array(height).fill().map( () => {
				return null;
			});
		});
	}

	__isValidCoordinate(x, y) {
		if (x < 0 || x >= this.width) {
			return false;
		}
		if (y < 0 || y >= this.height) {
			return false;
		}
		return true;
	}

	__clampValue(value, min, max) {
			return Math.max(min, Math.min(max, value));
	}

	__getCellTypeForCell(cell) {
		if (cell !== null) {
			const entries = Object.entries(this.cellTypes);
			for (let i = 0; i < entries.length; ++i) {
				if (entries[i][1].name === cell.constructor.name) {
					return entries[i][0];
				}
			}
		}
		return null;
	}

	__createCellFromCellType(cellType) {
		if (cellType !== null) {
			const type = this.cellTypes[cellType];
			return new type();
		}
		return null;
	}

	static getMooreNeighborhood() {
		return [
			{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
			{ x: -1, y:  0 }, { x: 1, y:  0 },
			{ x: -1, y:  1 }, { x: 0, y:  1 }, { x: 1, y:  1 }
		];
	}

	static getVonNeumannRange1Neighborhood() {
		return [
			{ x:  0, y: -1 },
			{ x: -1, y:  0 }, { x: 1, y:  0 },
			{ x:  0, y:  1 }
		];
	}

	static getVonNeumannRange2Neighborhood() {
		return [
			{ x:  0, y: -2 },
			{ x: -1, y: -1 }, { x: 0,  y: -1 }, { x: 1, y: -1 },
			{ x: -2, y:  0 }, { x: -1, y:  0 }, { x: 1, y:  0 }, { x: 2, y: 0 },
			{ x: -1, y:  1 }, { x: 0,  y:  1 }, { x: 1, y:  1 },
			{ x:  0, y:  2 }
		];
	}
}
