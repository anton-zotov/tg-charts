import { moveLineX, addElement, formatDate, getDayOfWeek } from "./functions";
import { fontFamily, popupConfig } from "./config";
import { fs, bold } from "./font";

const { header, value } = popupConfig;

export class Popup {
	constructor(chart, y, height) {
		this.chart = chart;
		this.x = -1;
		this.y = y;
		this.height = height;
		this.hidden = false;
		this.line = this.chart.addElement('line', { x1: this.x, x2: this.x, y1: this.y, y2: this.y + this.height, stroke: '#c0c', 'stroke-width': 1 });
		this.box = this.chart.addElement('g');
		this.border = addElement(this.box, 'rect', {
			x: 0, y: 0, width: 150, height: popupConfig.height,
			rx: 7, ry: 7,
			fill: this.chart.theme.background, style: 'filter:url(#shadow)'
		});
		this.label = addElement(this.box, 'text', { 
			x: popupConfig.padding.left, y: popupConfig.padding.top, 
			...fontFamily, ...fs(header.fontSize)
		});
		this.detailTexts = [];
	}

	move(points) {
		if (!points[0] || !points[0][1]) return;
		let [threshold, x, i, v] = points[0][1];
		this.show();
		if (x !== this.x) {
			this.x = x;
			let date = new Date(this.chart.data.columns[0][i]);
			let labelText = getDayOfWeek(date) + ', ' + formatDate(date);
			this.label.textContent = labelText;
			let width = Math.max(popupConfig.minWidth, this.setDetailTexts(points, i));
			this.border.setAttribute('width', width);
			moveLineX(this.line, x, x);
			this.box.setAttribute('transform', `translate(${x - width / 2}, 80)`);
			this.chart.svg.appendChild(this.box);
		}
	}

	setDetailTexts(lines, n) {
		let offsetX = popupConfig.padding.left;
		lines.forEach(([line, [threshold, x, _, v]], i) => {
			let texts = this.detailTexts[i];
			if (!texts) {
				let lineLabel = addElement(this.box, 'text', {
					x: offsetX, y: popupConfig.getY(popupConfig.lineName),
					stroke: line.color, fill: line.color,
					...fontFamily, ...fs(popupConfig.lineName.fontSize)
				});
				let lineValue = addElement(this.box, 'text', {
					x: offsetX, y: popupConfig.getY(value),
					fill: line.color, 
					...fontFamily, ...fs(value.fontSize), ...bold
				});
				texts = [lineLabel, lineValue];
				this.detailTexts.push(texts);
			}
			let [lineLabel, lineValue] = texts;
			lineLabel.textContent = line.label;
			lineValue.textContent = v;
			let labelBox = lineLabel.getBBox();
			let valueBox = lineValue.getBBox();
			offsetX += Math.max(labelBox.width + value.marginRight, valueBox.width + value.marginRight, value.minWidth);
		});
		return offsetX;
	}

	show() {
		if (!this.hidden) return;
		this.line.setAttribute('visibility', 'visible');
		this.box.setAttribute('visibility', 'visible');
		this.hidden = false;
		this.chart.svg.removeChild(this.box);
		// this.chart.svg.appendChild(this.box);
	}

	hide() {
		if (this.hidden || 1) return;
		this.line.setAttribute('visibility', 'hidden');
		this.box.setAttribute('visibility', 'hidden');
		this.hidden = true;
	}

	makeBoxD(width, height) {
		let s = `M 0 0 H ${width} V ${height} H 0 V 0`;
		return s;
	}
}