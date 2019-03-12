import { moveLine, addElement, moveRect } from "./functions";
import LineSet from "./lineSet";

export default class Preview {
	constructor(chart, y, height, data) {
		this.chart = chart;
		this.y = y;
		this.height = height;
		this.lineSet = new LineSet(chart, y, height, 3, data);
		this.viewboxStart = 0.6;
		this.viewboxEnd = 0.8;
		this.viewboxStartPx = chart.width * this.viewboxStart;
		this.viewboxEndPx = chart.width * this.viewboxEnd;
		let color = '#bbb';

		this.leftShadow = addElement(chart.svg, 'rect', { fill: '#ddd', 'fill-opacity': '0.7' });
		this.rightShadow = addElement(chart.svg, 'rect', { fill: '#ddd', 'fill-opacity': '0.7' });
		this.viewboxRect = addElement(chart.svg, 'rect', { fill: 'none', 'pointer-events': 'visible' });
		this.topViewboxBorder = addElement(chart.svg, 'line', { stroke: color, 'stroke-opacity': '0.7' });
		this.bottomViewboxBorder = addElement(chart.svg, 'line', { stroke: color, 'stroke-opacity': '0.7' });
		this.leftViewboxBorder = addElement(chart.svg, 'line', { stroke: color, 'stroke-opacity': '0.7', 'stroke-width': 10 });
		this.rightViewboxBorder = addElement(chart.svg, 'line', { stroke: color, 'stroke-opacity': '0.7', 'stroke-width': 10 });
		this.leftViewboxAdditionalBorder = addElement(chart.svg, 'rect', { fill: 'none', 'pointer-events': 'visible' });
		this.rightViewboxAdditionalBorder = addElement(chart.svg, 'rect', { fill: 'none', 'pointer-events': 'visible' });

		this.viewboxRect.onmousedown = this.onViewboxClick.bind(this);
		this.viewboxRect.addEventListener('touchstart', (e) => this.onViewboxClick(e.touches[0]));

		this.leftViewboxBorder.onmousedown = this.onLeftHandleClick.bind(this);
		this.leftViewboxBorder.addEventListener('touchstart', (e) => this.onLeftHandleClick(e.touches[0]));
		this.leftViewboxAdditionalBorder.addEventListener('touchstart', (e) => this.onLeftHandleClick(e.touches[0]));
		this.rightViewboxBorder.onmousedown = this.onRightHandleClick.bind(this);
		this.rightViewboxBorder.addEventListener('touchstart', (e) => this.onRightHandleClick(e.touches[0]));
		this.rightViewboxAdditionalBorder.addEventListener('touchstart', (e) => this.onRightHandleClick(e.touches[0]));

		document.onmousemove = this.onMouseMove.bind(this);
		document.addEventListener('touchmove', (e) => this.onMouseMove(e.touches[0]));

		document.onmouseup = this.onMouseRelease.bind(this);
		document.addEventListener('touchend', this.onMouseRelease.bind(this));

		this.positionViewbox();
	}

	onMouseMove(e) {
		if (this.dragStartX !== undefined) this.onViewboxMove(e.pageX);
		if (this.leftHandleDragStartX !== undefined) this.onLeftHandleMove(e.pageX);
		if (this.rightHandleDragStartX !== undefined) this.onRightHandleMove(e.pageX);
	}

	onMouseRelease() {
		this.dragStartX = undefined;
		this.leftHandleDragStartX = undefined;
		this.rightHandleDragStartX = undefined;
	}

	onLeftHandleClick(e) {
		this.leftHandleDragStartX = e.pageX;
	}

	onRightHandleClick(e) {
		this.rightHandleDragStartX = e.pageX;
	}

	onViewboxClick(e) {
		this.dragStartX = e.pageX;
	}

	onLeftHandleMove(pageX) {
		this.viewboxStartPx = Math.max(0, this.viewboxStartPx + pageX - this.leftHandleDragStartX);
		this.viewboxStartPx = Math.min(this.viewboxStartPx, this.viewboxEndPx);
		this.calcViewboxPercentage();
		this.positionViewbox();
		this.leftHandleDragStartX = pageX;
	}

	onRightHandleMove(pageX) {
		this.viewboxEndPx = Math.min(this.chart.width, this.viewboxEndPx + pageX - this.rightHandleDragStartX);
		this.viewboxEndPx = Math.max(this.viewboxStartPx, this.viewboxEndPx);
		this.calcViewboxPercentage();
		this.positionViewbox();
		this.rightHandleDragStartX = pageX;
	}

	onViewboxMove(pageX) {
		let width = this.viewboxEndPx - this.viewboxStartPx;
		this.viewboxStartPx += pageX - this.dragStartX;
		if (this.viewboxStartPx < 0) {
			this.viewboxStartPx = 0;
			this.viewboxEndPx = this.viewboxStartPx + width;
		} else {
			this.viewboxEndPx += pageX - this.dragStartX;
			if (this.viewboxEndPx > this.chart.width) {
				this.viewboxEndPx = this.chart.width;
				this.viewboxStartPx = this.viewboxEndPx - width;
			}
		}
		this.calcViewboxPercentage();
		this.positionViewbox();
		this.dragStartX = pageX;
	}

	calcViewboxPercentage() {
		this.viewboxStart = this.viewboxStartPx / this.chart.width;
		this.viewboxEnd = this.viewboxEndPx / this.chart.width;
		this.onChange();
	}

	positionViewbox() {
		let left = this.viewboxStartPx;
		let right = this.viewboxEndPx;
		moveLine(this.topViewboxBorder, left, this.y, right, this.y);
		moveLine(this.bottomViewboxBorder, left, this.y + this.height, right, this.y + this.height);
		moveLine(this.leftViewboxBorder, left, this.y, left, this.y + this.height);
		moveLine(this.rightViewboxBorder, right, this.y, right, this.y + this.height);
		moveRect(this.viewboxRect, left, this.y, right - left, this.height);
		moveRect(this.leftShadow, 0, this.y, left - 5, this.height);
		moveRect(this.rightShadow, right + 5, this.y, this.chart.width - right, this.height);
		moveRect(this.leftViewboxAdditionalBorder, left - 40, this.y, 35, this.height);
		moveRect(this.rightViewboxAdditionalBorder, right + 5, this.y, 35, this.height);
	}
}