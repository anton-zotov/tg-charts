import './main.scss';
import data from './chart_data.json';
import LineChart from './lineChart';

const charts = [];
function createChart(parent, data, options = {}) {
	let width = parent.clientWidth - 40;
	let height = parent.clientHeight / 10 * 6;
	let lineChart = new LineChart(parent, width, height, data, options);
	charts.push(lineChart);
}

function start() {
	// data.forEach(d => {
	// 	createChart(document.body, d);
	// });
	// createChart(document.body, data[0]);
	// createChart(document.body, data[1]);
	// createChart(document.body, data[2]);

	createChart(document.body, data[1]);
	createChart(document.body, data[3]);
	// createChart(document.body, data[3], { cachePreview: true });
	// createChart(document.body, data[4]);
	createChart(document.body, data[4], { cachePreview: true });
	// createChart(document.body, data[5]);
}

window.toggleTheme = (e) => {
	document.body.classList.toggle('dark-theme');
	let labelTheme = document.body.classList.contains('dark-theme') ? 'Day' : 'Night';
	e.target.textContent = `Switch to ${labelTheme} Mode`;
	charts.forEach(chart => chart.toggleTheme());
}

window.addEventListener('load', start);