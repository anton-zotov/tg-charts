import Line from "./line";
import { approachTarget } from "./functions";
import { lineMoveAnimationTime } from "./config";

export default class LineSet {
	constructor(chart, y, height, lineWidth, data, shownPartStart = 0, shownPartEnd = 1) {
		this.lines = [];
		this.height = height;
		this.chart = chart;
		let columns = data.columns.slice(1);
		let maxY = 0;
		for (let column of columns) {
			maxY = Math.max(maxY, ...column.slice(1));
		}
		let yCoeff = maxY ? (height / maxY) : 0;
		for (let column of columns) {
			let [name, ...ys] = column;
			this.lines.push(new Line(chart, y + height, yCoeff, name, data.names[name], ys, data.colors[name], lineWidth, shownPartStart, shownPartEnd));
		}
		this.highestPoint = maxY;
		this.targetHighestPoint = maxY;
		this.yAxesMoveSpeed = 0;
		// this.chart.drawables.push(this);
	}

	getHighestPoint() {
		let lines = this.lines.filter(line => line.shown);
		if (lines.length) this.lastHighestPoint = Math.max(...lines.map(line => line.getHighestPoint()));
		return this.lastHighestPoint;
	}

	update(config) {
		this.lines.forEach(line => line.config(config));
		// this.targetHighestPoint = this.getHighestPoint();
		// this.yAxesMoveSpeed = Math.abs(this.targetHighestPoint - this.highestPoint) / lineMoveAnimationTime;
		this.redraw()
	}

	// onDraw(dt) {
	// 	if (this.highestPoint !== this.targetHighestPoint) {
	// 		approachTarget(this, 'highestPoint', this.targetHighestPoint, this.yAxesMoveSpeed, dt);
	// 		this.redrawYAxes();
	// 	}
	// }

	redraw() {
		let yCoeff = this.highestPoint ? (this.height / this.highestPoint) : 0;
		this.lines.forEach(line => {
			line.yCoeff = yCoeff;
			line.redraw();
		});
	}

	toggleLine(lineName) {
		this.lines.find(line => line.name === lineName).toggle();
	}

	getPointsAtCoord(x) {
		return this.lines.map(line => {
			return [line, line.getPointAtCoord(x)];
		})
	}

	isOpacityStable() {
		return this.lines.every(line => line.opacity === line.targetOpacity);
	}
}