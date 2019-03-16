import { addPath, makeD, approachTarget } from "./functions";
import { yAxisOpacityPerSecond, lineOpacityPerSecond } from "./config";

export default class Line {
	constructor(chart, y, yCoeff, name, ys, color, width, shownPartStart, shownPartEnd) {
		this.chart = chart;
		this.name = name;
		this.ys = ys;
		this.color = color;
		this.width = width;
		this.y = y;
		this.yCoeff = yCoeff;
		this.shownPartStart = shownPartStart;
		this.shownPartEnd = shownPartEnd;
		this.shown = true;
		this.opacity = this.targetOpacity = 1;
		this.create();
		this.chart.drawables.push(this);
	}

	getHighestPoint() {
		let firstIndex = Math.floor(this.ys.length * this.shownPartStart);
		let endIndex = Math.min(this.ys.length, Math.ceil(this.ys.length * this.shownPartEnd) + 1);
		return Math.max(...this.ys.slice(firstIndex, endIndex));
	}

	getPoints() {
		let step = this.chart.width / Math.max(1, this.ys.length - 1) / (this.shownPartEnd - this.shownPartStart);
		let xOffset = this.chart.width / (this.shownPartEnd - this.shownPartStart) * this.shownPartStart;
		return this.ys.map((v, i) => {
			return [i * step - xOffset, this.y - v * this.yCoeff]
		});
	}

	create() {
		this.path = addPath(this.chart.svg, this.getPoints(), {
			stroke: this.color,
			'stroke-width': this.width,
			'stroke-linejoin': 'round',
			'stroke-linecap': 'round'
		});
	}

	config({ yCoeff, ys, shownPartStart, shownPartEnd }) {
		if (ys) this.ys = ys;
		if (yCoeff) this.yCoeff = yCoeff;
		if (shownPartStart) this.shownPartStart = shownPartStart;
		if (shownPartEnd) this.shownPartEnd = shownPartEnd;
	}

	redraw() {
		this.path.setAttribute('d', makeD(this.getPoints()));
	}

	toggle() {
		this.shown ? this.hide() : this.show();
	}

	hide() {
		this.targetOpacity = 0;
		this.shown = false;
	}

	show() {
		this.targetOpacity = 1;
		this.shown = true;
	}

	onDraw(dt) {
		if (this.opacity !== this.targetOpacity) {
			approachTarget(this, 'opacity', this.targetOpacity, lineOpacityPerSecond, dt);
			this.path.setAttribute('stroke-opacity', this.opacity);
		}
	}
}