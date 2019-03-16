import Text from "./text";
import { approachTarget } from "./functions";
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
		// this.view.chart.drawables.push(this);
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
		this.tick = this.view.chart.addElement('text',
			{
				x: this.x1, y: this.y - 8, 'font-family': 'sans-serif',
				'font-size': this.tickFontSize + 'px', fill: '#aaa'
			});
		this.tick.textContent = this.tickN;
	}

	update() {
		this.line.setAttribute('y1', this.y);
		this.line.setAttribute('y2', this.y);
		this.tick.setAttribute('y', this.y - 8);
	}

	hide() {
		this.targetOpacity = 0;
	}

	show() {
		this.opacity = 0;
		this.targetOpacity = 1;
	}

	onDraw(dt) {
		if (this.opacity === 0 && this.targetOpacity === 0) {
			return this.destroy();
		}
		if (this.opacity !== this.targetOpacity) {
			approachTarget(this, 'opacity', this.targetOpacity, yAxisOpacityPerSecond, dt);
			this.line.setAttribute('stroke-opacity', this.opacity);
			this.tick.setAttribute('fill-opacity', this.opacity);
		}
	}

	destroy() {
		// this.view.chart.drawables = this.view.chart.drawables.filter(dr => dr !== this);
		// this.line.remove();
		this.line.parentNode.removeChild(this.line);
		this.line = null;
		this.tick.parentNode.removeChild(this.tick);
		// this.tick.remove();
		this.tick = null;
		this.view.yAxes = this.view.yAxes.filter(yAxis => yAxis !== this);
	}
}