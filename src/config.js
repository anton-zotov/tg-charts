export const lineMoveAnimationTime = 0.2;
export const xTickOpacityPerSecond = 4;
export const yAxisOpacityPerSecond = 5;
export const lineOpacityPerSecond = 5;
export const minDt = 0.001;
export const defaultViewboxStart = 0.4;
export const defaultViewboxEnd = 0.6;
export const minViewboxWidthPx = 10;


export const fontFamily = { 'font-family': 'sans-serif' };
export const popupConfig = {
	minWidth: 140,
	height: 100,
	circleRadius: 10,
	padding: {
		left: 15,
		top: 30
	},
	header: {
		fontSize: 20,
	},
	value: {
		fontSize: 24,
		offsetTop: 36,
		minWidth: 40,
		marginRight: 16
	},
	lineName: {
		fontSize: 16,
		offsetTop: 56
	},
	getY(p) {
		return this.padding.top + p.offsetTop;
	}
}


export const lightTheme = {
	background: '#fff'
};
export const darkTheme = {
	background: '#242F3E'
};

export const tickFontSize = 30;
export const axisColor = '#ccc';
export const axisTextColor = '#aaa';