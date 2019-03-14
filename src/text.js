import { updateText, approachTarget } from "./functions";

export default class Text {
	constructor(chart, x, y, text, size, color, centered = false) {
		this.x = x;
		this.chart = chart;
		this.color = color;
		this.centered = centered;
		this.opacity = 1;
		this.targetOpacity = 1;
		this.opacityPerSecond = 4;
		this.element = chart.addElement('text',
			{ x, y, 'font-family': 'sans-serif', 'font-size': size + 'px', fill: color });
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
		updateText(this.element, this.centered ? x - this.width / 2 : x, y);
	}

	setText(t) {
		this.element.textContent = t;
	}

	hide() {
		this.targetOpacity = 0;
		// this.element.setAttribute('visibility', 'hidden');
	}

	show() {
		this.targetOpacity = 1;
		//this.element.removeAttribute('visibility');
	}

	onDraw(dt) {
		if (this.opacity !== this.targetOpacity) {
			approachTarget(this, 'opacity', this.targetOpacity, this.opacityPerSecond, dt);
			this.element.setAttribute('fill-opacity', this.opacity);
		}
	}
}