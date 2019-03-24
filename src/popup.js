import { translate, addElement, formatDate, getDayOfWeek, scale } from "./functions";
import { fontFamily, popupConfig } from "./config";
import { fs, bold } from "./font";

const { header, value } = popupConfig;

export class Popup {
	constructor(chart, y, height) {
		this.chart = chart;
		this.x = -1;
		this.height = height;
		this.hidden = true;
		this.shapesShown = [];
		this.mainGroup = addElement(this.chart.svg, 'g', { visibility: 'hidden' });
		this.lineGroup = addElement(this.mainGroup, 'g', {});
		this.line = addElement(this.lineGroup, 'line', {
			x1: 0, x2: 0, y1: y, y2: height + 10,
			stroke: this.chart.theme.popup.line, 'stroke-width': 2
		});
		this.box = addElement(this.mainGroup, 'g', {});
		this.border = addElement(this.box, 'rect', {
			x: 0, y: 0, width: 150, height: popupConfig.height,
			rx: popupConfig.borderRadius, ry: popupConfig.borderRadius,
			stroke: this.chart.theme.popup.border,
			fill: this.chart.theme.background
		});
		this.label = addElement(this.box, 'text', {
			x: popupConfig.padding.left, y: popupConfig.padding.top,
			...fontFamily, ...fs(header.fontSize),
		});
		this.detailTexts = [];
		this.lineCircles = [];
	}

	bringToFront() {
		this.chart.svg.appendChild(this.mainGroup);
	}

	move(points) {
		if (!points[0] || !points[0][1]) return;
		let [threshold, x, y, i, v] = points[0][1];
		this.show();
		if (x !== this.x) {
			this.x = x;
			let date = new Date(this.chart.data.columns[0][i + 1]);
			let labelText = getDayOfWeek(date) + ', ' + formatDate(date);
			this.label.textContent = labelText;
			let width = Math.max(popupConfig.minWidth, this.setDetailTexts(points, i));
			this.border.setAttribute('width', width);
			translate(this.lineGroup, x);
			let popupX = Math.max(3, x - width / 2, popupConfig.y);
			popupX = Math.min(this.chart.width - width - 3, popupX);
			translate(this.box, popupX);
		}
	}

	setDetailTexts(lines, n) {
		let offsetX = popupConfig.padding.left;
		let lastI = 0;
		lines.forEach(([line, [threshold, x, y, _, v]], i) => {
			lastI = i;
			this.toggleShapes(i, line.shown);
			if (!line.shown) return;
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
			} else {
				let [lineLabel, lineValue] = texts;
				lineLabel.setAttribute('x', offsetX);
				lineValue.setAttribute('x', offsetX);
			}
			let [lineLabel, lineValue] = texts;
			lineLabel.textContent = line.label;
			lineValue.textContent = v;
			let labelBox = lineLabel.getBBox();
			let valueBox = lineValue.getBBox();
			offsetX += Math.max(labelBox.width + value.marginRight, valueBox.width + value.marginRight, value.minWidth);

			// circles
			let circle = this.lineCircles[i];
			if (!circle) {
				circle = addElement(this.lineGroup, 'circle', {
					cx: 0, cy: 0, r: popupConfig.circle.radius, stroke: line.color, 'stroke-width': popupConfig.circle.width,
					fill: this.chart.theme.background
				});
				this.lineCircles.push(circle);
			}
			translate(circle, 0, y);
		});
		return offsetX;
	}

	toggleShapes(i, show) {
		if (this.shapesShown[i] !== show) {
			let circle = this.lineCircles[i];
			if (circle) {
				let [lineLabel, lineValue] = this.detailTexts[i];
				if (show) {
					lineLabel.removeAttribute('visibility');
					lineValue.removeAttribute('visibility');
					circle.removeAttribute('visibility');
				} else {
					lineLabel.setAttribute('visibility', 'hidden');
					lineValue.setAttribute('visibility', 'hidden');
					circle.setAttribute('visibility', 'hidden');
				}
			}
			this.shapesShown[i] = show;
		}
	}

	showShapes(i) {
		this.toggleShapes(i, true);
	}

	hideShapes(i) {
		this.toggleShapes(i, false);
	}

	show() {
		if (!this.hidden) return;
		this.mainGroup.setAttribute('visibility', 'visible');
		this.hidden = false;
	}

	hide() {
		if (this.hidden) return;
		this.mainGroup.setAttribute('visibility', 'hidden');
		this.hidden = true;
	}

	makeBoxD(width, height) {
		let s = `M 0 0 H ${width} V ${height} H 0 V 0`;
		return s;
	}

	updateTheme() {
		this.border.setAttribute('fill', this.chart.theme.background);
		this.label.setAttribute('fill', this.chart.theme.text);
		this.line.setAttribute('stroke', this.chart.theme.popup.line);
		this.border.setAttribute('stroke', this.chart.theme.popup.border);
		this.lineCircles.forEach(circle => circle.setAttribute('fill', this.chart.theme.background));
	}
}