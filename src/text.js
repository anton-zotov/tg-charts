import { updateText, approachTarget } from "./functions";
import { xTickOpacityPerSecond } from "./config";

export default class Text {
	constructor(chart, x, y, text, size, color, centered = false, transparent = false) {
		this.x = x;
		this.chart = chart;
		this.color = color;
		this.centered = centered;
		this.opacity = this.targetOpacity = transparent ? 0 : 1;
		this.element = chart.addElement('text',
			{ x, y, 'font-family': 'sans-serif', 'font-size': size + 'px', fill: color, 'fill-opacity': this.opacity });
		this.element.textContent = text;
		let box = this.element.getBBox();
		this.width = box.width;
		this.height = box.height;
		if (centered) {
			this.x = x - this.width / 2;
			this.element.setAttribute('x', x);
		}
		this.chart.drawables.push(this);
	}

	move(x, y) {
		if (this.opacity && (this.inViewport(this.x) || this.inViewport(x))) {
			this.x = x;
			updateText(this.element, this.centered ? x - this.width / 2 : x, y);
			return 1;
		}
		return 0;
	}

	inViewport(x) {
		let r = this.centered ? x + this.width / 2 : x + this.width;
		let l = this.centered ? x - this.width / 2 : x;
		return (r >= 0 && l < this.chart.width);
	}

	setText(t) {
		this.element.textContent = t;
	}

	hide() {
		this.targetOpacity = 0;
	}

	show() {
		this.targetOpacity = 1;
	}

	onDraw(dt) {
		if (this.opacity !== this.targetOpacity) {
			approachTarget(this, 'opacity', this.targetOpacity, xTickOpacityPerSecond, dt);
			this.element.setAttribute('fill-opacity', this.opacity);
		}
	}
}