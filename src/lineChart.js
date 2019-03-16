import LineChartView from "./lineChartView";
import Preview from "./preview";

export default class LineChart {
	constructor(parent, width, height, data) {
		this.parent = parent;
		this.width = width;
		this.height = height;
		this.data = data;
		this.drawables = [];
		this.prevAnimationTimestamp = 0;
		this.appendSvg();
		this.appendButtons();

		let previewHeight = Math.round(this.height / 8);
		this.view = new LineChartView(this, 50, this.height - previewHeight * 2);
		this.view.createLines(data);
		this.preview = new Preview(this, this.height - previewHeight, previewHeight, data);
		this.preview.onChange = () => {
			this.view.update({ shownPartStart: this.preview.viewboxStart, shownPartEnd: this.preview.viewboxEnd });
		}
		this.preview.onChange();
		window.requestAnimationFrame(this.animate.bind(this));

		// setInterval(() => {
		// 	console.log('childElementCount', this.svg.childElementCount);
		// }, 500);
	}

	appendSvg() {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('width', this.width);
		this.svg.setAttribute('height', this.height);
		this.parent.appendChild(this.svg);
	}

	appendButtons() {
		let buttonsHolder = document.createElement('div');
		buttonsHolder.classList.add('bh');
		Object.entries(this.data.names).forEach(([name, label]) => {
			let button = document.createElement('button');
			button.textContent = label;
			button.classList.add('c');
			button.onclick = () => {
				this.view.toggleLine(name);
				if (button.classList.contains('c')) {
					button.classList.remove('c');
				} else {
					button.classList.add('c');
				}
			}
			buttonsHolder.appendChild(button);
		});
		this.parent.appendChild(buttonsHolder);
	}

	addElement(tagName, attributes = {}) {
		let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
		return this.svg.appendChild(el);
		return el;
	}

	animate(timestamp) {
		let dt = (timestamp - this.prevAnimationTimestamp) / 1000;
		this.drawables.forEach(drawable => drawable.onDraw(dt));
		this.prevAnimationTimestamp = timestamp;
		window.requestAnimationFrame(this.animate.bind(this));
	}
}