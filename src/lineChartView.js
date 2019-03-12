import { createLineSet, getAxisTicks, moveLine, updateText } from "./functions";
import LineSet from "./lineSet";

const yAxesStartX = 15;

export default class LineChartView {
	constructor(chart, y, height) {
		this.y = y;
		this.chart = chart;
		this.height = height;
		this.yAxes = [];
		this.yAxesTicks = [];
	}

	createLines(data) {
		this.lineSet = new LineSet(this.chart, this.y, this.height, 6, data, 0.1, 0.3);
		this.createYAxes();
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
			let t = this.chart.addElement('text',
				{ x: yAxesStartX, y: y - 8, 'font-family': "sans-serif", 'font-size': "18px", fill: "#aaa" });
			t.textContent = tickN;
			this.yAxesTicks.push(t);
		});
	}

	updateYAxis() {
		let hp = this.lineSet.getHighestPoint();
		let tickNumbers = getAxisTicks(hp);
		let yCoeff = this.height / hp;
		[0, ...tickNumbers].forEach((tickN, i) => {
			let y = this.y + this.height - tickN * yCoeff;
			moveLine(this.yAxes[i], yAxesStartX, y, this.chart.width, y);
			updateText(this.yAxesTicks[i], yAxesStartX, y - 8, tickN);
		});
	}

	update(config) {
		this.lineSet.update(config);
		this.updateYAxis();
	}
}