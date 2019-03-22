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

export function translate(line, x, y = 0) {
	line.setAttribute('transform', `translate(${x}, ${y})`);
}

export function scale(line, x, y = 1) {
	line.setAttribute('transform', `scale(${x}, ${y})`);
}

export function translateScale(el, tx, sx, ty = 0, sy = 1) {
	return el.setAttribute('transform', `translate(${tx}, ${ty}) scale(${sx} ${sy})`);
}

export function moveLineY(line, y1, y2) {
	line.setAttribute('y1', y1);
	line.setAttribute('y2', y2);
}

export function updateText(text, x, y, t = null) {
	text.setAttribute('x', x);
	text.setAttribute('y', y);
	if (t !== null) text.textContent = t;
}

let ticksCache = {};
let prevMax = -100;
let prevTicks = [1, 2, 3, 4, 5];
export function getAxisTicks(max) {
	if (prevMax * 0.95 <= max && prevMax * 1.05 >= max) return prevTicks;
	if (!ticksCache[max]) {
		const gridN = 5;
		let step = Math.floor(max * 0.95 / gridN);
		let ticks = Array.from(Array(gridN).keys()).map(n => (n + 1) * step);
		ticksCache[max] = ticks;
	}
	prevMax = max;
	prevTicks = ticksCache[max];
	return prevTicks;
}

export function ticksAreEqual(t1, t2) {
	let t1l = t1.length;
	let t2l = t2.length;
	return t1l && t2l && t1l === t2l && t1[t1l - 1] === t2[t2l - 1];
}

let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatDate(date) {
	return `${months[date.getMonth()]} ${date.getDate()}`;
}

let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function getDayOfWeek(date) {
	return daysOfWeek[date.getDay()];
}

let pows2 = Array(20).fill(0).map((_, i) => Math.pow(2, i + 1));
export function ceilToPow2(n) {
	return pows2.find(p => p >= n);
}

export function approachTarget(obj, propName, targetValue, changeSpeed, dt) {
	let sign = Math.sign(targetValue - obj[propName]);
	obj[propName] += sign * changeSpeed * dt;
	if ((sign > 0 && obj[propName] > targetValue) ||
		sign < 0 && obj[propName] < targetValue) obj[propName] = targetValue;
}

export const dc = document.createElement.bind(document);

export const average = arr => Math.round(arr.reduce((p, c) => p + c, 0) / arr.length);