import { axisColor, fontFamily, axisTextColor, yAxisOpacityPerSecond, tickFontSize } from "./config";
import { fs } from "./font";
import { addElement, scale, approachTarget, translate } from "./functions";

export default class YAxisSet {
	constructor(view, tickNumbers) {
		this.view = view;
		this.opacity = this.targetOpacity = 1;
		this.highestPoint = view.highestPoint;
		this.mainGroup = addElement(this.view.chart.svg, 'g', {}, true);
		this.groups = [];
		this.create(tickNumbers);
	}

	create(tickNumbers) {
		tickNumbers.forEach((tickN) => {
			let y = this.getTickY(tickN);
			let g = addElement(this.mainGroup, 'g', {
				transform: `translate(0, ${y})`
			}, true);
			this.groups.push([g, tickN]);
			addElement(g, 'line', {
				x1: 0, y1: 0, x2: this.view.chart.width, y2: 0,
				stroke: axisColor, 'stroke-width': 1
			});
			let tick = addElement(g, 'text', {
				x: 0, y: -8, ...fontFamily,
				...fs(tickFontSize), fill: axisTextColor
			});
			tick.textContent = tickN;
		});
	}

	getTickY(tickN) {
		let yCoeff = this.view.height / this.view.highestPoint;
		return this.view.y + this.view.height - tickN * yCoeff;
	}

	getScaleY() {
		return this.highestPoint / this.view.highestPoint;
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
		// scale(this.mainGroup, 1, this.getScaleY());
		this.groups.forEach(([group, tickN]) => {
			translate(group, 0, this.getTickY(tickN));
		});
		if (this.opacity !== this.targetOpacity) {
			approachTarget(this, 'opacity', this.targetOpacity, yAxisOpacityPerSecond, dt);
			this.mainGroup.setAttribute('stroke-opacity', this.opacity);
			this.mainGroup.setAttribute('fill-opacity', this.opacity);
		}
	}

	destroy() {
		this.mainGroup.remove();
		this.mainGroup = null;
		this.view.yAxisSets = this.view.yAxisSets.filter(set => set !== this);
	}
}