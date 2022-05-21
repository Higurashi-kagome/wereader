// 引入包
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config.base');

// webpack 的配置信息
const devConfig = {
	mode: 'development',
	devtool: 'source-map',

	optimization: {
		// 压缩代码
		minimize: false,
		// https://github.com/terser/terserx
		minimizer: [new TerserWebpackPlugin ({
			extractComments: false,
			// 清除 console.log
			terserOptions: {
				compress: {
					// pure_funcs: ['console.log']
				},
			}
		})],
	},
}

module.exports = merge(commonConfig, devConfig)