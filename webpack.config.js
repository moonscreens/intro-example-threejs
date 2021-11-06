const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	output: {
		path: `${__dirname}/dist`,
		filename: 'bundle.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			hash: true,
		}),
	],
	devServer: {
		contentBase: `${__dirname}/dist`,
		compress: true,
		port: 1234,
	},
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|webp)$/i,
				loader: 'file-loader',
				options: {
					outputPath: 'images',
				},
			},
			{
				test: /\.html$/i,
				use: ['html-loader'],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
};