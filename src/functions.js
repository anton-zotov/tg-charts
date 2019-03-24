export function addElement(svg, tagName, attributes = {}, prepend = false) {
	let el = document.createElementNS('http://www.w3.org/2000/svg', tagName);
	Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
	return prepend ? svg.insertBefore(el, svg.firstChild) : svg.appendChild(el);
}

export function makeD(coords) {
	if (coords.length < 2) return '';
	let a = coords.map(([x, y]) => `${x} ${y}`);
	return 'M ' + a.join(' L ');
}

export function addPath(svg, coords, attributes = {}, prepend = true) {
	return addElement(svg, 'path', {
		d: makeD(coords), fill: 'none',
		...attributes
	}, prepend);
}

export function translate(line, x, y = 0) {
	if (Number.isFinite(x) && Number.isFinite(y))
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
	if (prevMax <= max && prevMax * 1.05 >= max) {
		return prevTicks;
	}
	prevMax = max;
	if (!ticksCache[max]) {
		const gridN = 5;
		max = beautifyNumber(max * 0.92, gridN, 0.04);
		let step = Math.floor(max / gridN);
		let ticks = Array.from(Array(gridN).keys()).map(n => (n + 1) * step);
		ticksCache[max] = ticks;
	}
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

export function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

export const average = arr => Math.round(arr.reduce((p, c) => p + c, 0) / arr.length);

export function beautifyNumber(n, gridN, delta = 0.05) {
	function makeDel(i) {
		let dels = [5, 10, 25];
		return dels[i % dels.length] * Math.pow(10, Math.floor(i / dels.length));
	}
	let nMax = n * (1 + delta);
	let nMin = n * (1 - delta);
	let step = n / gridN;
	let k = 0;
	while (k < 50) {
		let del = makeDel(k++);
		let newN = Math.round(step / del) * del * gridN;
		if (newN > nMax || newN < nMin) return n;
		n = newN;
	}
	return n;
}

export function getShortenNumberInfo(n) {
	n = n.toString();
	let zeros = 0;
	for (let i = n.length - 1; i >= 0; i--) {
		if (n[i] === '0') zeros++;
	}
	let letters = [[0, ''], [3, 'k'], [6, 'm'], [9, 'b']];
	return letters.reverse().find(([rn, l]) => zeros >= rn);
}

export function shortenNumber(n, replaceN, letter) {
	n = n.toString();
	return n.slice(0, n.length - replaceN) + letter;
}