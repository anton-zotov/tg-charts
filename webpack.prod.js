const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		main: [
			'./src/index.js'
		]
	},
	resolve: {
		mainFields: [
			'main'
		],
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader',
					{
						loader: 'sass-loader',
						options: {
							implementation: require('sass')
						}
					}]
			}, {
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"]
					}
				}
			}
		]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};