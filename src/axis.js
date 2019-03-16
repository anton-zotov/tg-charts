import Text from "./text";
import { moveLine, updateText, approachTarget } from "./functions";
import { yAxisOpacityPerSecond } from "./config";

export default class YAxis {
	constructor(view, x1, x2, color, tickN, tickFontSize) {
		this.view = view;
		this.x1 = x1;
		this.x2 = x2;
		this.color = color;
		this.tickN = tickN;
		this.tickFontSize = tickFontSize;
		this.opacity = this.targetOpacity = 1;
		this.create();
		this.view.chart.drawables.push(this);
	}

	get y() {
		let yCoeff = this.view.height / this.view.highestPoint;
		return this.view.y + this.view.height - this.tickN * yCoeff;
	}

	create() {
		this.line = this.view.chart.addElement('line', {
			x1: this.x1, y1: this.y, x2: this.x2, y2: this.y,
			stroke: this.color, 'stroke-width': 1
		});
		this.tick = new Text(this.view.chart, this.x1, this.y - 8, this.tickN, this.tickFontSize, '#aaa');
	}

	update() {
		moveLine(this.line, this.x1, this.y, this.x2, this.y);
		this.tick.move(this.x1, this.y - 8);
	}

	hide() {
		this.targetOpacity = 0;
	}

	show() {
		this.opacity = 0;
		this.targetOpacity = 1;
	}

	onDraw(dt) {
		if (this.opacity !== this.targetOpacity) {
			approachTarget(this, 'opacity', this.targetOpacity, yAxisOpacityPerSecond, dt);
			this.line.setAttribute('stroke-opacity', this.opacity);
			this.tick.element.setAttribute('fill-opacity', this.opacity);
		} else {
			if (this.opacity === 0) {
				this.view.yAxes = this.view.yAxes.filter(yAxis => yAxis !== this);
			}
		}
	}
}