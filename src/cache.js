import { addElement } from "./functions";

const b64Start = 'data:image/svg+xml;base64,';

export default class Cache {
	constructor(x, y, width, height, elements) {
		this.width = width;
		this.height = height;
		this.elements = elements;
		this.parent = elements[0].parentNode;;
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', height);
		//document.body.appendChild(this.canvas);
		this.svgImage = document.createElement('img', { x: 0, y: 0, width, height });
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', `0 ${y} ${width} ${height}`);
		this.cacheImage = addElement(this.parent, 'image', { x, y, width, height, visibility: 'hidden' });
	}

	show() {
		if (this.isCacheShown) return;
		this.isCacheShown = true;
		for (let element of this.elements) {
			this.svg.appendChild(element);
		}
		let xml = new XMLSerializer().serializeToString(this.svg);
		for (let element of this.elements) {
			this.parent.insertBefore(element, this.parent.firstChild);
		}

		this.svgImage.onload = () => {
			let ctx = this.canvas.getContext('2d');
			ctx.fillStyle = '#ff0';
			ctx.fillRect(0, 0, this.width, this.height);
			ctx.drawImage(this.svgImage, 0, 0);

			this.cacheImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.canvas.toDataURL());
			this.cacheImage.setAttribute('visibility', 'visible');
			for (let element of this.elements) {
				element.remove();
			}
		}
		this.svgImage.src = b64Start + btoa(xml);
	}

	hide() {
		if (!this.isCacheShown) return;
		for (let element of this.elements) {
			this.parent.insertBefore(element, this.parent.firstChild);
		}
		this.cacheImage.setAttribute('visibility', 'hidden');
		this.isCacheShown = false;
	}
}