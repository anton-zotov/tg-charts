import LineChartView from "./lineChartView";
import Preview from "./preview";

export default class LineChart {
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

	addElement(tagName, attributes = {}) {
		let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
		return this.svg.appendChild(el);
	}
}