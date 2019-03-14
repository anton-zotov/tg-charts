import Line from "./line";

export function addElement(svg, tagName, attributes = {}) {
	let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
	Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
	return svg.appendChild(el);
}

export function makeD(coords) {
	let d = '';
	if (coords[0]) {
		d += `M ${coords[0][0]} ${coords[0][1]}`;
	}
	for (let i = 1; i < coords.length; i++) {
		d += ` L ${coords[i][0]} ${coords[i][1]}`;
	}
	return d;
}

export function addPath(svg, coords, attributes = {}) {
	return addElement(svg, 'path', {
		d: makeD(coords), fill: 'none',
		...attributes
	});
}

export function moveLine(line, x1, y1, x2, y2) {
	line.setAttribute('x1', x1);
	line.setAttribute('x2', x2);
	line.setAttribute('y1', y1);
	line.setAttribute('y2', y2);
}

export function moveRect(line, x, y, w, h) {
	line.setAttribute('x', x);
	line.setAttribute('y', y);
	line.setAttribute('width', Math.max(0, w));
	line.setAttribute('height', h);
}

export function updateText(text, x, y, t = null) {
	text.setAttribute('x', x);
	text.setAttribute('y', y);
	if (t !== null) text.textContent = t;
}

export function getAxisTicks(max) {
	const gridN = 5;
	let step = Math.floor(max * 0.95 / gridN);
	return Array.from(Array(gridN).keys()).map(n => (n + 1) * step);
}

export function formatDate(date) {
	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${months[date.getMonth()]} ${date.getDate()}`;
}

let pows2 = Array(20).fill(0).map((_, i) => Math.pow(2, i + 1));
export function ceilToPow2(n) {
	return pows2.find(p => p >= n);
}