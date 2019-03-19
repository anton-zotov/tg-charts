import './main.css';
import data from './chart_data.json';
import LineChart from './lineChart';

function createChart(parent, data) {
	let width = parent.clientWidth;
	let height = parent.clientHeight / 3 * 2;
	let lineChart = new LineChart(parent, width, height, data);
}

function start() {
	createChart(document.body, data[5]);
}

window.addEventListener('load', start);