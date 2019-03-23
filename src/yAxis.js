import Text from "./text";
import { approachTarget } from "./functions";
import { yAxisOpacityPerSecond, fontFamily, axisTextColor, axisColor, tickFontSize } from "./config";
import { fs } from "./font";

export default class YAxis {
	constructor(view, tickN) {
		this.view = view;
		this.tickN = tickN;
		this.opacity = this.targetOpacity = 1;
		this.create();
		// this.view.chart.drawables.push(this);
	}

	create() {
		let y = this.view.y + this.view.height;
		this.line = this.view.chart.addElement('line', {
			x1: 0, y1: y, x2: this.view.chart.width, y2: y,
			stroke: this.view.chart.theme.axis.line, 'stroke-width': 2
		});
		this.tick = this.view.chart.addElement('text',
			{
				x: 0, y: y - 8, ...fontFamily,
				...fs(tickFontSize), fill: this.view.chart.theme.axis.text
			});
		this.tick.textContent = this.tickN;
	}

	updateTheme() {
		this.line.setAttribute('stroke', this.view.chart.theme.axis.line);
		this.tick.setAttribute('fill', this.view.chart.theme.axis.text);
	}

	// update() {
	// 	this.line.setAttribute('y1', this.y);
	// 	this.line.setAttribute('y2', this.y);
	// 	this.tick.setAttribute('y', this.y - 8);
	// }

	// hide() {
	// 	this.targetOpacity = 0;
	// }

	// show() {
	// 	this.opacity = 0;
	// 	this.targetOpacity = 1;
	// }

	// onDraw(dt) {
	// 	if (this.opacity === 0 && this.targetOpacity === 0) {
	// 		return this.destroy();
	// 	}
	// 	if (this.opacity !== this.targetOpacity) {
	// 		approachTarget(this, 'opacity', this.targetOpacity, yAxisOpacityPerSecond, dt);
	// 		this.line.setAttribute('stroke-opacity', this.opacity);
	// 		this.tick.setAttribute('fill-opacity', this.opacity);
	// 	}
	// }

	// destroy() {
	// 	// this.view.chart.drawables = this.view.chart.drawables.filter(dr => dr !== this);
	// 	// this.line.remove();
	// 	this.line.parentNode.removeChild(this.line);
	// 	this.line = null;
	// 	this.tick.parentNode.removeChild(this.tick);
	// 	// this.tick.remove();
	// 	this.tick = null;
	// 	this.view.yAxes = this.view.yAxes.filter(yAxis => yAxis !== this);
	// }
}