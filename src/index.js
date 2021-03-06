import './main.scss';
import data from './chart_data.json';
import './polyfills';
import LineChart from './lineChart';

const charts = [];
function createChart(parent, data, options = {}) {
	let width = parent.clientWidth;
	let height = parent.clientHeight / 10 * 6;
	let lineChart = new LineChart(parent, width, height, data, options);
	charts.push(lineChart);
}

function start() {
	data.forEach(d => {
		createChart(document.body, d, { cachePreview: true });
	});
}

window.toggleTheme = (e) => {
	document.body.classList.toggle('dark-theme');
	let labelTheme = document.body.classList.contains('dark-theme') ? 'Day' : 'Night';
	e.target.textContent = `Switch to ${labelTheme} Mode`;
	charts.forEach(chart => chart.toggleTheme());
}

window.addEventListener('load', start);