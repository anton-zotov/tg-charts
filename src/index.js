import './main.css';
import data from './chart_data.json';
import LineChart from './lineChart';

function createChart(parent, data, options = {}) {
	let width = parent.clientWidth;
	let height = parent.clientHeight / 3 * 2;
	let lineChart = new LineChart(parent, width, height, data, options);
}

function start() {
	// data.forEach(d => {
	// 	createChart(document.body, d);
	// });
	// createChart(document.body, data[0]);
	// createChart(document.body, data[1]);
	// createChart(document.body, data[2]);
	createChart(document.body, data[3]);
	createChart(document.body, data[3], { cachePreview: true });
	createChart(document.body, data[4]);
	createChart(document.body, data[4], { cachePreview: true });
	createChart(document.body, data[5]);
}

window.addEventListener('load', start);