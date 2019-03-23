export const lineMoveAnimationTime = 0.2;
export const xTickOpacityPerSecond = 4;
export const yAxisOpacityPerSecond = 5;
export const lineOpacityPerSecond = 5;
export const minDt = 0.001;
export const defaultViewboxStart = 0.4;
export const defaultViewboxEnd = 0.6;
export const minViewboxWidthPx = 10;
export const lineWidth = 6;


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
	text: 'black'
};
export const darkTheme = {
	background: '#242F3E',
	text: 'white'
};

export const tickFontSize = 30;
export const axisColor = '#ccc';
export const axisTextColor = '#aaa';