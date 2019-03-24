const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	devServer: {
		contentBase: './dist'
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
			}
		]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};