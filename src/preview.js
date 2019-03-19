import { addElement, moveLineX, approachTarget } from "./functions";
import LineSet from "./lineSet";
import { defaultViewboxStart, defaultViewboxEnd, minViewboxWidthPx, lineMoveAnimationTime } from "./config";

export default class Preview {
	constructor(chart, y, height, data) {
		this.chart = chart;
		this.y = y;
		this.height = height;
		this.lineSet = new LineSet(chart, y, height, 3, data);
		this.viewboxStart = defaultViewboxStart;
		this.viewboxEnd = defaultViewboxEnd;
		this.widthChanged = this.shadowWidthChanged = true;
		this.viewboxStartPx = chart.width * this.viewboxStart;
		this.viewboxEndPx = chart.width * this.viewboxEnd;
		this.highestPoint = this.targetHighestPoint = this.lineSet.getHighestPoint();
		this.highestPointChangeSpeed = 0;
		
		this.viewboxRect = addElement(chart.svg, 'rect',
		{ fill: 'none', 'pointer-events': 'visible', height: this.height, y: this.y });
		
		this.leftShadow = addElement(chart.svg, 'rect',
		{ fill: '#ddd', 'fill-opacity': '0.7', height: this.height, y: this.y });
		this.rightShadow = addElement(chart.svg, 'rect',
		{ fill: '#ddd', 'fill-opacity': '0.7', height: this.height, y: this.y });
		
		this.leftViewboxAdditionalBorder = addElement(chart.svg, 'rect',
		{ fill: 'none', 'pointer-events': 'visible', height: this.height, y: this.y, width: 35 });
		this.rightViewboxAdditionalBorder = addElement(chart.svg, 'rect',
		{ fill: 'none', 'pointer-events': 'visible', height: this.height, y: this.y, width: 35 });
		
		let color = '#bbb';
		this.topViewboxBorder = addElement(chart.svg, 'line',
		{ stroke: color, 'stroke-opacity': '0.7', y1: this.y, y2: this.y });
		this.bottomViewboxBorder = addElement(chart.svg, 'line',
			{ stroke: color, 'stroke-opacity': '0.7', y1: this.y + this.height, y2: this.y + this.height });
		this.leftViewboxBorder = addElement(chart.svg, 'line',
			{ stroke: color, 'stroke-opacity': '0.7', 'stroke-width': 10, y1: this.y, y2: this.y + this.height });
		this.rightViewboxBorder = addElement(chart.svg, 'line',
			{ stroke: color, 'stroke-opacity': '0.7', 'stroke-width': 10, y1: this.y, y2: this.y + this.height });

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
		this.chart.drawables.push(this);
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
		this.viewboxStartPx = Math.min(this.viewboxStartPx, this.viewboxEndPx - minViewboxWidthPx);
		this.calcViewboxPercentage();
		this.widthChanged = true;
		this.positionViewbox();
		this.leftHandleDragStartX = pageX;
	}

	onRightHandleMove(pageX) {
		this.viewboxEndPx = Math.min(this.chart.width, this.viewboxEndPx + pageX - this.rightHandleDragStartX);
		this.viewboxEndPx = Math.max(this.viewboxStartPx + minViewboxWidthPx, this.viewboxEndPx);
		this.calcViewboxPercentage();
		this.widthChanged = true;
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
		this.shadowWidthChanged = true;
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
		moveLineX(this.topViewboxBorder, left, right);
		moveLineX(this.bottomViewboxBorder, left, right);
		moveLineX(this.leftViewboxBorder, left, left);
		moveLineX(this.rightViewboxBorder, right, right);
		let rects = [
			[this.viewboxRect, left, right - left, this.widthChanged],
			[this.leftShadow, 0, Math.max(left - 5, 0), this.shadowWidthChanged || this.widthChanged],
			[this.rightShadow, right + 5, this.chart.width - right, this.shadowWidthChanged || this.widthChanged],
			[this.leftViewboxAdditionalBorder, left - 40, 0, false],
			[this.rightViewboxAdditionalBorder, right + 5, 0, false],
		];
		rects.forEach(([rect, x, width, widthChanged]) => {
			rect.setAttribute('x', x);
			if (widthChanged) rect.setAttribute('width', width);
		});
		this.widthChanged = false;
	}

	toggleLine(lineName) {
		this.lineSet.toggleLine(lineName);
		this.onHpChange();
	}

	onHpChange() {
		let hp = this.targetHighestPoint;
		this.targetHighestPoint = this.lineSet.getHighestPoint();
		if (hp !== this.targetHighestPoint) {
			this.highestPointChangeSpeed = Math.abs(this.targetHighestPoint - this.highestPoint) / lineMoveAnimationTime;
		}
	}

	onDraw(dt) {
		if (this.highestPoint !== this.targetHighestPoint) {
			console.log('preview redraw');
			approachTarget(this, 'highestPoint', this.targetHighestPoint, this.highestPointChangeSpeed, dt);
			this.lineSet.highestPoint = this.highestPoint;
			this.lineSet.redraw();
		}
	}
}