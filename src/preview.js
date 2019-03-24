import { addElement, translate, approachTarget, translateScale, scale } from "./functions";
import LineSet from "./lineSet";
import { defaultViewboxStart, defaultViewboxEnd, minViewboxWidthPx, lineMoveAnimationTime, viewboxHandleWidth } from "./config";
import Cache from "./cache";

const defaultViewboxWidth = 100;
const getScale = x => Math.max(x, 0) / defaultViewboxWidth;

export default class Preview {
	constructor(chart, y, height, data) {
		this.chart = chart;
		this.y = y;
		this.height = height;
		this.lineSet = new LineSet(chart, y, height, 3, data);
		this.viewboxStart = defaultViewboxStart;
		this.viewboxEnd = defaultViewboxEnd;
		this.widthChanged = true;
		this.viewboxStartPx = chart.width * this.viewboxStart;
		this.viewboxEndPx = chart.width * this.viewboxEnd;
		this.highestPoint = this.targetHighestPoint = this.lineSet.getHighestPoint();
		this.highestPointChangeSpeed = 0;
		this.cache = new Cache(chart, 0, y, this.chart.width, height, this.lineSet.lines.map(line => line.path));

		this.clipPath = addElement(chart.svg, 'clipPath', { id: 'previewClip' });
		this.clipPathRect = addElement(this.clipPath, 'rect', {
			x: 0, y, width: this.chart.width, height
		});
		this.lineSet.clip('previewClip');

		this.group = addElement(chart.svg, 'g', { x: 0, y: this.y });
		this.middleGroup = addElement(this.group, 'g', { x: 0, y: this.y });
		this.rightGroup = addElement(this.group, 'g', { x: defaultViewboxWidth, y: this.y });

		let borderColor = this.chart.theme.preview.border;
		// left group
		this.leftShadow = addElement(this.group, 'rect',
			{ fill: this.chart.theme.preview.shadow, x: -this.chart.width, width: this.chart.width, height: this.height, y: 0 });
		this.leftViewboxBorder = addElement(this.group, 'rect',
			{ fill: borderColor, x: 0, width: viewboxHandleWidth, y: 0, height: this.height });

		// middle group
		this.viewboxRect = addElement(this.middleGroup, 'rect',
			{ fill: 'none', 'pointer-events': 'visible', x: 0, width: defaultViewboxWidth, height: this.height, y: 0 });
		this.topViewboxBorder = addElement(this.middleGroup, 'line',
			{ stroke: borderColor, 'stroke-width': 2, x1: 0, x2: defaultViewboxWidth, y1: 1, y2: 1 });
		this.bottomViewboxBorder = addElement(this.middleGroup, 'line',
			{ stroke: borderColor, 'stroke-width': 2, x1: 0, x2: defaultViewboxWidth, y1: this.height - 1, y2: this.height - 1 });

		// right group
		this.rightShadow = addElement(this.rightGroup, 'rect',
			{ fill: this.chart.theme.preview.shadow, x: 0, width: this.chart.width, height: this.height, y: 0 });
		this.rightViewboxBorder = addElement(this.rightGroup, 'rect',
			{ fill: borderColor, x: -10, width: viewboxHandleWidth, y: 0, height: this.height });

		this.viewboxRect.onmousedown = this.onViewboxClick.bind(this);
		this.viewboxRect.addEventListener('touchstart', (e) => this.onViewboxClick(e.touches[0]));

		this.leftViewboxBorder.onmousedown = this.onLeftHandleClick.bind(this);
		this.leftViewboxBorder.addEventListener('touchstart', (e) => this.onLeftHandleClick(e.touches[0]));
		this.leftShadow.addEventListener('touchstart', (e) => this.onLeftHandleClick(e.touches[0]));
		this.rightViewboxBorder.onmousedown = this.onRightHandleClick.bind(this);
		this.rightViewboxBorder.addEventListener('touchstart', (e) => this.onRightHandleClick(e.touches[0]));
		this.rightShadow.addEventListener('touchstart', (e) => this.onRightHandleClick(e.touches[0]));

		document.addEventListener('mousemove', this.onMouseMove.bind(this));
		document.addEventListener('touchmove', (e) => this.onMouseMove(e.touches[0]));

		document.addEventListener('mouseup', this.onMouseRelease.bind(this));
		document.addEventListener('touchend', this.onMouseRelease.bind(this));

		this.positionViewbox();
		this.chart.drawables.push(this);
		this.cachePreview();
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
		this.widthChanged = true;
		this.calcViewboxPercentage();
		this.positionViewbox();
		this.leftHandleDragStartX = pageX;
	}

	onRightHandleMove(pageX) {
		this.viewboxEndPx = Math.min(this.chart.width, this.viewboxEndPx + pageX - this.rightHandleDragStartX);
		this.viewboxEndPx = Math.max(this.viewboxStartPx + minViewboxWidthPx, this.viewboxEndPx);
		this.widthChanged = true;
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
		this.onChange(!this.widthChanged);
	}

	positionViewbox() {
		let left = this.viewboxStartPx;
		let right = this.viewboxEndPx;
		let width = right - left;
		let scaleX = getScale(width - 20);
		if (this.widthChanged) {
			translateScale(this.middleGroup, 10, scaleX);
			translate(this.rightGroup, width);
		}
		translate(this.group, left, this.y);
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
			this.restorePreview();
			approachTarget(this, 'highestPoint', this.targetHighestPoint, this.highestPointChangeSpeed, dt);
			this.lineSet.highestPoint = this.highestPoint;
			this.lineSet.redraw();
		} if (!this.lineSet.isOpacityStable()) {
			this.restorePreview();
		} else {
			this.cachePreview();
		}
	}

	cachePreview() {
		if (!this.chart.options.cachePreview) return;
		this.cache.show();
	}

	restorePreview() {
		if (!this.chart.options.cachePreview) return;
		this.cache.hide();
	}

	updateTheme() {
		this.cache.updateTheme();
		this.leftViewboxBorder.setAttribute('fill', this.chart.theme.preview.border);
		this.rightViewboxBorder.setAttribute('fill', this.chart.theme.preview.border);
		this.topViewboxBorder.setAttribute('stroke', this.chart.theme.preview.border);
		this.bottomViewboxBorder.setAttribute('stroke', this.chart.theme.preview.border);
		this.leftShadow.setAttribute('fill', this.chart.theme.preview.shadow);
		this.rightShadow.setAttribute('fill', this.chart.theme.preview.shadow);
	}
}