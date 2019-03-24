import { fontFamily, tickFontSize } from "./config";
import { fs } from "./font";

export default class YAxis {
	constructor(view, tickN) {
		this.view = view;
		this.tickN = tickN;
		this.opacity = this.targetOpacity = 1;
		this.create();
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
}