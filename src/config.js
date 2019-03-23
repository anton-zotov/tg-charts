export const lineMoveAnimationTime = 0.2;
export const xTickOpacityPerSecond = 4;
export const yAxisOpacityPerSecond = 5;
export const lineOpacityPerSecond = 5;
export const minDt = 0.001;
export const defaultViewboxStart = 0.4;
export const defaultViewboxEnd = 0.6;
export const minViewboxWidthPx = 10;
export const lineWidth = 6;

export const viewboxHandleWidth = 10;


export const fontFamily = { 'font-family': 'sans-serif' };
export const popupConfig = {
	minWidth: 240,
	y: 0,
	height: 155,
	circle: {
		radius: 10,
		width: lineWidth
	},
	borderRadius: 14,
	padding: {
		left: 25,
		top: 45
	},
	header: {
		fontSize: 32,
	},
	value: {
		fontSize: 36,
		offsetTop: 54,
		minWidth: 40,
		marginRight: 36
	},
	lineName: {
		fontSize: 24,
		offsetTop: 86
	},
	getY(p) {
		return this.padding.top + p.offsetTop;
	}
}


export const lightTheme = {
	background: '#fff',
	text: 'black',
	preview: {
		shadow: 'rgba(244, 244, 246, 0.8)',
		border: 'rgba(177, 202, 216, 0.4)'
	},
	popup: {
		border: '#d0d0d0',
		line: '#DFE6EB'
	},
	axis: {
		line: '#F2F4F5',
		text: '#96A2AA'
	}
};
export const darkTheme = {
	background: '#242F3E',
	text: 'white',
	preview: {
		shadow: 'rgba(31, 41, 53, 0.8)',
		border: 'rgba(99, 133, 165, 0.4)'
	},
	popup: {
		border: '#181818',
		line: '#3B4A5A'
	},
	axis: {
		line: '#293544',
		text: '#546778'
	}
};

export const tickFontSize = 30;
export const axisTextColor = '#aaa';