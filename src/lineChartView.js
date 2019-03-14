import { createLineSet, getAxisTicks, moveLine, updateText, formatDate, ceilToPow2 } from "./functions";
import LineSet from "./lineSet";
import Text from "./text";

const yAxesStartX = 15;
const defaultViewboxStart = 0.6;
const defaultViewboxEnd = 0.8;
const tickFontSize = 30;

export default class LineChartView {
	constructor(chart, y, height) {
		this.y = y;
		this.chart = chart;
		this.height = height;
		this.yAxes = [];
		this.yAxesTicks = [];
		this.xAxesTicks = [];
		this.xTickWidth = 0;
		this.xTickY = this.y + this.height + 26;
	}

	createLines(data) {
		this.xs = data.columns[0].slice(1);
		this.lineSet = new LineSet(this.chart, this.y, this.height, 6, data, defaultViewboxStart, defaultViewboxEnd);
		this.createYAxes();
		this.createXTicks();
	}

	createYAxes() {
		let hp = this.lineSet.getHighestPoint();
		let tickNumbers = getAxisTicks(hp);
		let yCoeff = this.height / hp;
		[0, ...tickNumbers].forEach(tickN => {
			let y = this.y + this.height - tickN * yCoeff;
			this.yAxes.push(
				this.chart.addElement('line', {
					x1: yAxesStartX, y1: y, x2: this.chart.width, y2: y,
					stroke: '#ccc', 'stroke-width': 1
				})
			);
			let t = new Text(this.chart, yAxesStartX, y - 8, tickN, tickFontSize, '#aaa')
			this.yAxesTicks.push(t);
		});
	}

	createXTicks() {
		let viewboxDiff = defaultViewboxEnd - defaultViewboxStart;
		let step = this.chart.width / Math.max(1, this.xs.length - 1) / viewboxDiff;
		let xOffset = this.chart.width / viewboxDiff * defaultViewboxStart;
		this.xs.forEach((ts, i) => {
			let t = new Text(this.chart, i * step - xOffset, this.xTickY, formatDate(new Date(ts)), tickFontSize, '#aaa', true)
			this.xAxesTicks.push(t);
			this.xTickWidth = Math.max(this.xTickWidth, t.width);
		});
		this.xTickWidth *= 1.2;
	}

	updateYAxis() {
		let hp = this.lineSet.getHighestPoint();
		let tickNumbers = getAxisTicks(hp);
		let yCoeff = this.height / hp;
		[0, ...tickNumbers].forEach((tickN, i) => {
			let y = this.y + this.height - tickN * yCoeff;
			moveLine(this.yAxes[i], yAxesStartX, y, this.chart.width, y);
			this.yAxesTicks[i].setText(tickN);
		});
	}

	updateXAxis(shownPartStart, shownPartEnd) {
		let viewboxDiff = shownPartEnd - shownPartStart;
		let step = this.chart.width / Math.max(1, this.xs.length - 1) / viewboxDiff;
		let xOffset = this.chart.width / viewboxDiff * shownPartStart;
		let showEvery = 0;
		if (step < this.xTickWidth) {
			let del = this.xTickWidth / step;
			showEvery = ceilToPow2(del);
		}
		this.xAxesTicks.forEach((tick, i) => {
			tick.move(i * step - xOffset, this.xTickY);
			if (showEvery && (i + 1) % showEvery !== 0) tick.hide();
			else tick.show();
		});
	}

	update(config) {
		let { shownPartStart, shownPartEnd } = config;
		this.lineSet.update(config);
		this.updateYAxis();
		this.updateXAxis(shownPartStart, shownPartEnd);
	}
}