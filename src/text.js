import { updateText, approachTarget } from "./functions";
import { xTickOpacityPerSecond, fontFamily } from "./config";
import { fs } from "./font";

export default class Text {
	constructor(chart, x, y, text, size, color, centered = false, transparent = false) {
		this.x = x;
		this.chart = chart;
		this.color = color;
		this.centered = centered;
		this.opacity = this.targetOpacity = transparent ? 0 : 1;
		this.element = chart.addElement('text',
			{ x, y, ...fontFamily, ...fs(size), fill: color, 'fill-opacity': this.opacity });
		this.element.textContent = text;
		let box = this.element.getBBox();
		this.width = box.width;
		this.height = box.height;
		this.x = x - this.width / 2;
		this.element.setAttribute('x', this.x);
		this.chart.drawables.push(this);
	}

	moveX(x) {
		x -= this.width / 2;
		if (this.opacity && (this.inViewport(this.x) || this.inViewport(x))) {
			this.x = x;
			this.element.setAttribute('x', this.x);
			return 1;
		}
		return 0;
	}

	inViewport(x) {
		let r = x + this.width;
		let l = x;
		return (r >= 0 && l < this.chart.width);
	}

	setText(t) {
		this.element.textContent = t;
	}

	hide() {
		this.targetOpacity = 0;
		if (this.opacity !== this.targetOpacity && !this.inViewport(this.x)) {
			this.opacity = 0;
			this.element.setAttribute('fill-opacity', this.opacity);
		}
	}

	show() {
		this.targetOpacity = 1;
		if (this.opacity === 0) {
			this.opacity = 0.0001;
		}
		if (this.opacity !== this.targetOpacity && !this.inViewport(this.x)) {
			this.opacity = 1;
			this.element.setAttribute('fill-opacity', this.opacity);
		}
	}

	onDraw(dt) {
		if (this.opacity !== this.targetOpacity) {
			// console.log('animate', this.element.textContent, this.x);
			approachTarget(this, 'opacity', this.targetOpacity, xTickOpacityPerSecond, dt);
			this.element.setAttribute('fill-opacity', this.opacity);
		}
	}
}