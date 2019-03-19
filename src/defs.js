import { dc, addElement } from './functions';

function shadow(svg) {
	let f = addElement(svg, 'filter', { id: 'shadow', height: '130%' });
	addElement(f, 'feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 2 });
	addElement(f, 'feOffset', { dx:0, dy: 1, result: 'offsetblur' });
	let ct = addElement(f, 'feComponentTransfer');
	addElement(ct, 'feFuncA', { type: 'linear', slope: 0.2 });
	let m = addElement(f, 'feMerge');
	addElement(m, 'feMergeNode');
	addElement(m, 'feMergeNode', { in: 'SourceGraphic' });
}

export function appendDefs(svg) {
	[shadow].forEach(def => def(svg));
}