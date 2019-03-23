const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	devtool: 'inline-source-map',
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