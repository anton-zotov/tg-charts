import { addPath, makeD, approachTarget } from "./functions";
import { yAxisOpacityPerSecond, lineOpacityPerSecond } from "./config";

export default class Line {
	constructor(chart, parent, y, yCoeff, name, label, ys, color, width, shownPartStart, shownPartEnd) {
		this.chart = chart;
		this.name = name;
		this.label = label;
		this.ys = ys;
		this.color = color;
		this.width = width;
		this.parent = parent;
		this.y = y;
		this.yCoeff = yCoeff;
		this.shownPartStart = shownPartStart;
		this.shownPartEnd = shownPartEnd;
		this.shown = true;
		this.opacity = this.targetOpacity = 1;
		this.create();
		this.chart.drawables.push(this);
		this.pointPosCache = [];
	}

	getHighestPoint() {
		let [firstIndex, endIndex] = this.getShownIndexes();
		// return Math.max(...this.ys);
		return Math.max(...this.ys.slice(firstIndex, endIndex));
	}

	getShownIndexes() {
		let firstIndex = Math.max(0, Math.floor((this.ys.length - 1) * this.shownPartStart));
		let endIndex = Math.min(this.ys.length, Math.ceil((this.ys.length - 1) * this.shownPartEnd) + 1);
		return [firstIndex, endIndex];
	}

	getPoints(onlyShown = true) {
		let width = Math.max(0.001, this.shownPartEnd - this.shownPartStart);
		let start = Math.max(0.001, this.shownPartStart);
		let step = this.chart.width / Math.max(1, this.ys.length - 1) / width;
		let xOffset = this.chart.width / width * start;
		let ys = this.ys;
		let startI = 0;
		if (onlyShown) {
			let [firstIndex, endIndex] = this.getShownIndexes();
			startI = firstIndex;
			ys = this.ys.slice(firstIndex, endIndex);
		}
		this.pointPosCache = [];
		let ysLen = ys.length;
		let temp = ys.map((v, i) => {
			let currentY = this.y - v * this.yCoeff;
			let currentPos = (i + startI) * step - xOffset;
			this.pointPosCache.push([currentPos + step / 2 + 20, currentPos, currentY, i + startI, v]);
			return [currentPos, currentY]
		});
		return temp;
	}

	getPointAtCoord(x) {
		let res = this.pointPosCache.find(([px]) => px > x);
		if (!res) res = this.pointPosCache[this.pointPosCache.length - 1];
		return res;
	}

	create() {
		this.path = addPath(this.parent, this.getPoints(), {
			stroke: this.color,
			'stroke-width': this.width,
			'stroke-linejoin': 'round',
			'stroke-linecap': 'round'
		});
	}

	config({ yCoeff, ys, shownPartStart, shownPartEnd }) {
		if (ys) this.ys = ys;
		if (yCoeff) this.yCoeff = yCoeff;
		this.shownPartStart = shownPartStart;
		this.shownPartEnd = shownPartEnd;
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

	move(x) {
		this.path.setAttribute('transform', `translate(${x}, 0)`);
	}
}