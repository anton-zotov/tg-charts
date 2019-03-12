import Line from "./line";

export default class LineSet {
	constructor(chart, y, height, lineWidth, data, shownPartStart = 0, shownPartEnd = 1) {
		this.lines = [];
		this.height = height;
		let maxY = 0;
		let columns = data.columns.slice(1);
		for (let column of columns) {
			maxY = Math.max(maxY, ...column.slice(1));
		}
		let yCoeff = maxY ? (height / maxY) : 0;
		for (let column of columns) {
			let [name, ...ys] = column;
			this.lines.push(new Line(chart, y + height, yCoeff, name, ys, data.colors[name], lineWidth, shownPartStart, shownPartEnd));
		}
	}

	getHighestPoint() {
		return Math.max(...this.lines.map(line => line.getHighestPoint()));
	}

	update(config) {
		this.lines.forEach(line => line.config(config));
		let hp = this.getHighestPoint();
		let yCoeff = hp ? (this.height / hp) : 0;
		this.lines.forEach(line => {
			line.yCoeff = yCoeff;
			line.redraw();
		});
	}
}