import { createLineSet, getAxisTicks, formatDate, ceilToPow2, approachTarget } from "./functions";
import LineSet from "./lineSet";
import Text from "./text";
import YAxis from "./yAxis";
import { lineMoveAnimationTime, defaultViewboxStart, defaultViewboxEnd } from "./config";
import { Popup } from "./popup";

const yAxesStartX = 15;
const tickFontSize = 30;

export default class LineChartView {
	constructor(chart, y, height) {
		this.y = y;
		this.chart = chart;
		this.height = height;
		this.yAxes = [];
		this.xAxesTicks = [];
		this.xTickWidth = 0;
		this.xTickY = this.y + this.height + 26;
		this.highestPointChangeSpeed = 0;

		this.background = this.chart.addElement('rect', { x: 0, y: this.y, width: this.chart.width, height: this.height, fill: '#fff' });
		this.background.addEventListener('mousemove', this.onHover.bind(this));
		this.background.addEventListener('mouseleave', () => this.popup.hide());

		this.popup = new Popup(chart, y, height);
	}

	onHover(e) {
		let points = this.lineSet.getPointsAtCoord(e.pageX);
		this.showPopup(points);
	}

	showPopup(points) {
		if (!points.length) return;
		this.popup.move(points);
	}

	createLines(data) {
		this.xs = data.columns[0].slice(1);
		this.lineSet = new LineSet(this.chart, this.y, this.height, 6, data, defaultViewboxStart, defaultViewboxEnd);
		this.highestPoint = this.targetHighestPoint = this.lineSet.getHighestPoint();
		this.createYAxes(true);
		this.createXTicks();
		this.chart.drawables.push(this);
	}

	createYAxes(initial = false) {
		let tickNumbers = getAxisTicks(this.targetHighestPoint);
		tickNumbers.forEach(tickN => {
			let yAxis = new YAxis(this, yAxesStartX, this.chart.width, '#ccc', tickN, tickFontSize);
			if (!initial) yAxis.show();
			this.yAxes.push(yAxis);
		});
	}

	createXTicks() {
		let viewboxDiff = defaultViewboxEnd - defaultViewboxStart;
		let step = this.chart.width / Math.max(1, this.xs.length - 1) / viewboxDiff;
		let xOffset = this.chart.width / viewboxDiff * defaultViewboxStart;
		this.xs.forEach((ts, i) => {
			let t = new Text(this.chart, i * step - xOffset, this.xTickY, formatDate(new Date(ts)), tickFontSize, '#aaa', true, true);
			this.xAxesTicks.push(t);
			this.xTickWidth = Math.max(this.xTickWidth, t.width);
		});
		this.xTickWidth *= 1.2;
	}

	updateXAxis(shownPartStart, shownPartEnd) {
		let viewboxDiff = shownPartEnd - shownPartStart;
		let step = this.chart.width / Math.max(1, this.xs.length - 1) / viewboxDiff;
		let xOffset = this.chart.width / viewboxDiff * shownPartStart;
		let tx = step - xOffset;
		let showEvery = 0;
		if (step < this.xTickWidth) {
			let del = this.xTickWidth / step;
			showEvery = ceilToPow2(del);
		}
		let moved = 0;
		this.xAxesTicks.forEach((tick, i) => {
			if (showEvery && i % showEvery !== 0) tick.hide();
			else tick.show();
			moved += tick.moveX(i * step - xOffset);
		});
		// console.log('moved', moved);
	}

	isShown(i, step) {
		if (step >= this.xTickWidth) return true;
		return !!(i % ceilToPow2(this.xTickWidth / step));
	}

	update(config) {
		let { shownPartStart, shownPartEnd } = config;
		this.lineSet.update(config);
		this.updateXAxis(shownPartStart, shownPartEnd);
		this.onHpChange();

	}

	onHpChange() {
		let hp = this.targetHighestPoint;
		this.targetHighestPoint = this.lineSet.getHighestPoint();
		if (hp !== this.targetHighestPoint) {
			this.yAxes.forEach(yAxis => yAxis.hide());
			this.createYAxes();
			this.highestPointChangeSpeed = Math.abs(this.targetHighestPoint - this.highestPoint) / lineMoveAnimationTime;
		}
	}

	onDraw(dt) {
		if (this.highestPoint !== this.targetHighestPoint) {
			approachTarget(this, 'highestPoint', this.targetHighestPoint, this.highestPointChangeSpeed, dt);
			this.lineSet.highestPoint = this.highestPoint;
			this.lineSet.redraw();
			this.yAxes.forEach(yAxis => {
				yAxis.update();
				yAxis.onDraw(dt);
			});
		}
	}

	toggleLine(lineName) {
		this.lineSet.toggleLine(lineName);
		this.onHpChange();
	}
}