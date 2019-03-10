import './main.css';
import data from './chart_data.json';

let body;

function addSvgElement(svg, tagName, attributes) {
	let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
	Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
	return svg.appendChild(el);
}

function addRect(svg, x, y, width, height, fillColor) {
	addSvgElement(svg, 'rect', { x, y, width, height, fill: fillColor });
}

function addLine(svg, x1, y1, x2, y2, color) {
	addSvgElement(svg, 'line', { x1, y1, x2, y2, stroke: color });
}

function addPath(svg, color, coords) {
	let d = '';
	if (coords[0]) {
		d += `M ${coords[0][0]} ${coords[0][1]}`;
	}
	for (let i = 1; i < coords.length; i++) {
		d += ` L ${coords[i][0]} ${coords[i][1]}`;
	}
	addSvgElement(svg, 'path', {
		d, stroke: color, fill: 'none',
		'stroke-width': 2,
		'stroke-linejoin': 'round',
		'stroke-linecap': 'round'
	});
}

function addSvg() {
	let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '800');
	svg.setAttribute('height', '500');
	svg.setAttribute('preserveAspectRatio', 'none');
	return body.appendChild(svg);
}

function start() {
	body = document.getElementsByTagName('body')[0];
	let svg1 = addSvg();
	svg1.setAttribute('viewBox', '0 0 100 500');
	addRect(svg1, 10, 10, 100, 100, '#c0a');
	// addLine(svg1, 100, 100, 200, 300, '#30f');
	let points = data[0].columns[1].slice(1).map((v, i) => [i * 10, 500 - v]);
	addPath(svg1, data[0].colors.y0, points);
}

window.addEventListener('load', start);