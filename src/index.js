import './main.css';
import data from './chart_data.json';

function addElement(svg, tagName, attributes = {}) {
	let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
	Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
	return svg.appendChild(el);
}

function makeD(coords) {
	let d = '';
	if (coords[0]) {
		d += `M ${coords[0][0]} ${coords[0][1]}`;
	}
	for (let i = 1; i < coords.length; i++) {
		d += ` L ${coords[i][0]} ${coords[i][1]}`;
	}
	return d;
}

function addPath(svg, coords, attributes = {}) {
	return addElement(svg, 'path', {
		d: makeD(coords), fill: 'none',
		...attributes
	});
}

function moveLine(line, x1, y1, x2, y2) {
	line.setAttribute('x1', x1);
	line.setAttribute('x2', x2);
	line.setAttribute('y1', y1);
	line.setAttribute('y2', y2);
}

function moveRect(line, x, y, w, h) {
	line.setAttribute('x', x);
	line.setAttribute('y', y);
	line.setAttribute('width', w);
	line.setAttribute('height', h);
}

function createLineSet(chart, y, height, lineWidth, data, shownPartStart = 0, shownPartEnd = 1) {
	let lines = [];
	let maxY = 0;
	let columns = data.columns.slice(1);
	for (let column of columns) {
		maxY = Math.max(maxY, ...column.slice(1));
	}
	let yCoeff = maxY ? (height / maxY) : 0;
	for (let column of columns) {
		let [name, ...ys] = column;
		lines.push(new Line(chart, y + height, yCoeff, name, ys, data.colors[name], lineWidth, shownPartStart, shownPartEnd));
	}
	return lines;
}

class LineChartView {
	constructor(chart, y, height) {
		this.y = y;
		this.chart = chart;
		this.height = height;
		this.lines = [];
	}

	createLines(data) {
		this.lines = createLineSet(this.chart, this.y, this.height, 6, data, 0.1, 0.3);
	}

	update(config) {
		this.lines.forEach(line => line.update(config));
	}
}

class Line {
	constructor(chart, y, yCoeff, name, ys, color, width, shownPartStart, shownPartEnd) {
		this.chart = chart;
		this.name = name;
		this.ys = ys;
		this.color = color;
		this.width = width;
		this.y = y;
		this.yCoeff = yCoeff;
		this.shownPartStart = shownPartStart;
		this.shownPartEnd = shownPartEnd;
		this.create();
	}

	getPoints() {
		let step = this.chart.width / this.ys.length / (this.shownPartEnd - this.shownPartStart);
		let xOffset = this.chart.width / (this.shownPartEnd - this.shownPartStart) * this.shownPartStart;
		return this.ys.map((v, i) => {
			return [i * step - xOffset, this.y - v * this.yCoeff]
		});
	}

	create() {
		this.path = addPath(this.chart.svg, this.getPoints(), {
			stroke: this.color,
			'stroke-width': this.width,
			'stroke-linejoin': 'round',
			'stroke-linecap': 'round'
		});
	}

	update({ yCoeff, ys, shownPartStart, shownPartEnd }) {
		if (ys) this.ys = ys;
		if (yCoeff) this.yCoeff = yCoeff;
		if (shownPartStart) this.shownPartStart = shownPartStart;
		if (shownPartEnd) this.shownPartEnd = shownPartEnd;
		this.path.setAttribute('d', makeD(this.getPoints()));
	}
}

class Preview {
	constructor(chart, y, height, data) {
		this.chart = chart;
		this.y = y;
		this.height = height;
		this.lines = createLineSet(chart, y, height, 3, data);
		this.viewboxStart = 0.6;
		this.viewboxEnd = 0.8;
		this.viewboxStartPx = chart.width * this.viewboxStart;
		this.viewboxEndPx = chart.width * this.viewboxEnd;
		let color = '#aaa';

		this.leftShadow = addElement(chart.svg, 'rect', { fill: '#ccc', 'fill-opacity': '0.7' });
		this.rightShadow = addElement(chart.svg, 'rect', { fill: '#ccc', 'fill-opacity': '0.7' });
		this.viewboxRect = addElement(chart.svg, 'rect', { fill: 'none', 'pointer-events': 'visible' });
		this.topViewboxBorder = addElement(chart.svg, 'line', { stroke: color });
		this.bottomViewboxBorder = addElement(chart.svg, 'line', { stroke: color });
		this.leftViewboxBorder = addElement(chart.svg, 'line', { stroke: color, 'stroke-width': 30 });
		this.rightViewboxBorder = addElement(chart.svg, 'line', { stroke: color, 'stroke-width': 30 });

		this.viewboxRect.onmousedown = this.onViewboxClick.bind(this);
		this.viewboxRect.addEventListener('touchstart', (e) => this.onViewboxClick(e.touches[0]));

		this.leftViewboxBorder.onmousedown = this.onLeftHandleClick.bind(this);
		this.leftViewboxBorder.addEventListener('touchstart', (e) => this.onLeftHandleClick(e.touches[0]));
		this.rightViewboxBorder.onmousedown = this.onRightHandleClick.bind(this);
		this.rightViewboxBorder.addEventListener('touchstart', (e) => this.onRightHandleClick(e.touches[0]));

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
		this.calcViewboxPercentage();
		this.positionViewbox();
		this.leftHandleDragStartX = pageX;
	}

	onRightHandleMove(pageX) {
		this.viewboxEndPx = Math.min(this.chart.width, this.viewboxEndPx + pageX - this.rightHandleDragStartX);
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
		moveRect(this.leftShadow, 0, this.y, left, this.height);
		moveRect(this.rightShadow, right, this.y, this.chart.width - right, this.height);
	}
}

class LineChart {
	constructor(parent, width, height, data) {
		this.parent = parent;
		this.width = width;
		this.height = height;
		this.data = data;
		this.appendSvg();

		let previewHeight = Math.round(this.height / 8);
		this.view = new LineChartView(this, 50, this.height - previewHeight * 2);
		this.view.createLines(data);
		this.preview = new Preview(this, this.height - previewHeight, previewHeight, data);
		this.preview.onChange = () => {
			this.view.update({ shownPartStart: this.preview.viewboxStart, shownPartEnd: this.preview.viewboxEnd });
		}
		this.preview.onChange();
	}

	appendSvg() {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('width', this.width);
		this.svg.setAttribute('height', this.height);
		this.parent.appendChild(this.svg);
	}
}

function createChart(parent, data) {
	let width = parent.clientWidth;
	let height = parent.clientHeight / 3 * 2;
	let lineChart = new LineChart(parent, width, height, data);
}

function start() {
	createChart(document.body, data[0]);
}

window.addEventListener('load', start);