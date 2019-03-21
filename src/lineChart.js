import LineChartView from "./lineChartView";
import Preview from "./preview";
import { minDt, lightTheme } from "./config";
import { getDefs, appendDefs } from "./defs";
import { dc, average } from "./functions";

export default class LineChart {
	constructor(parent, width, height, data, options) {
		this.parent = parent;
		this.width = width;
		this.height = height;
		this.data = data;
		this.options = options;
		this.drawables = [];
		this.prevAnimationTimestamp = 0;
		this.isViewDirty = true;
		this.theme = lightTheme;
		this.animateTimes = [];
		this.fpsPool = [];
		this.appendFPS();
		this.appendSvg();
		appendDefs(this.svg);
		this.appendButtons();

		let previewHeight = Math.round(this.height / 8);
		this.view = new LineChartView(this, 50, this.height - previewHeight * 2);
		this.view.createLines(data);
		this.preview = new Preview(this, this.height - previewHeight, previewHeight, data);
		this.preview.onChange = () => this.isViewDirty = true;
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
		let buttonsHolder = dc('div');
		buttonsHolder.classList.add('bh');
		Object.entries(this.data.names).forEach(([name, label]) => {
			let button = dc('button');
			button.textContent = label;
			button.classList.add('c');
			button.onclick = () => {
				this.view.toggleLine(name);
				this.preview.toggleLine(name);
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

	appendFPS() {
		this.fps = document.createElement('div');
		this.fps.classList.add('fps')
		this.parent.appendChild(this.fps);
	}

	addElement(tagName, attributes = {}) {
		let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
		return this.svg.appendChild(el);
		return el;
	}

	animate(timestamp) {
		this.animateFrame = this.animateFrame || 0;
		let startT = performance.now();
		let dt = (timestamp - this.prevAnimationTimestamp) / 1000;
		if (minDt > dt) return window.requestAnimationFrame(this.animate.bind(this));
		if (this.isViewDirty) {
			this.view.update({ shownPartStart: this.preview.viewboxStart, shownPartEnd: this.preview.viewboxEnd });
			this.isViewDirty = false;
		}
		this.drawables.forEach(drawable => drawable.onDraw(dt));
		this.prevAnimationTimestamp = timestamp;
		window.requestAnimationFrame(this.animate.bind(this));

		const poolSize = 20;
		let animateTime = Math.round((performance.now() - startT) * 1000);
		if (this.animateTimes.length >= poolSize) this.animateTimes.shift();
		this.animateTimes.push(animateTime);
		if (this.fpsPool.length >= poolSize) this.fpsPool.shift();
		this.fpsPool.push(Math.round(1 / dt));
		if (this.animateFrame % poolSize === 0) {
			this.fps.textContent = `fps: ${average(this.fpsPool)} animate time: ${average(this.animateTimes)}`;
		}
		this.animateFrame++;
	}
}