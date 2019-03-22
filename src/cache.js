const b64Start = 'data:image/svg+xml;base64,';

function createSVGUrl(svg) {
	var svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
	return URL.createObjectURL(svgBlob);
};

export default class Cache {
	constructor(width, height, yOffset) {
		this.width = width;
		this.height = height;
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', height);
		//document.body.appendChild(this.canvas);
		this.svgImage = document.createElement('img', { x: 0, y: 0, width, height });
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', `0 ${yOffset} ${width} ${height}`);
	}

	cacheElements(...elements) {
		let parent = elements[0].parentNode;
		for (let element of elements) {
			this.svg.appendChild(element);
		}
		let xml = new XMLSerializer().serializeToString(this.svg);
		// let url = createSVGUrl(this.svg);
		for (let element of elements) {
			parent.insertBefore(element, parent.firstChild);
		}
		return new Promise(resolve => {
			this.svgImage.onload = () => {
				let ctx = this.canvas.getContext('2d');
				ctx.fillStyle = '#fff';
				ctx.fillRect(0, 0, this.width, this.height);
				ctx.drawImage(this.svgImage, 0, 0);
				resolve();
			}
			this.svgImage.src = b64Start + btoa(xml);
		});
		// document.body.appendChild(this.canvas);
	}
}