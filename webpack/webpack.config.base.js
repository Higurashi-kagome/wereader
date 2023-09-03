// 引入包
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')

const cssLoaders = [
	"style-loader", // 用来将 css 引入到代码中
	"css-loader", // 用来处理 css 代码
	// 引入 postcss，处理 css 的兼容性问题
	{
		loader: "postcss-loader",
		options: {
			postcssOptions: {
				plugins: [
					[
						"postcss-preset-env",
						{
							browsers: 'last 2 versions' // 兼容最新的两个版本的浏览器
						}
					]
				]
			}
		}
	}
]

const lessLoaders = cssLoaders.concat(["less-loader"]) // less-loader 将 less 和 webpage 整合在一起

const babelLoader = {
	// 指定加载器
	loader:"babel-loader",
	// 设置 babel
	options: {
		// 设置预定义的环境
		presets:[
			[
				// 指定环境的插件
				"@babel/preset-env",
				// 配置信息
				{
					// 要兼容的目标浏览器
					targets: "defaults",
					corejs: "3",
					// 使用 core-js 的方式 "usage" 表示按需加载
					useBuiltIns: "usage"
				}
			]
		]
	}
}

// webpack 的配置信息
module.exports = {
	// 配置入口
	entry: {
		// offscreen 脚本
		offscreen: path.resolve(__dirname, "..", "src", "offscreen.ts"),
		// 内容注入脚本
		content: path.resolve(__dirname, "..", "src", "content.ts"),
		// 窗口页面
		popupPage: path.resolve(__dirname, "..", "src/popup/page", "popup-page.tsx"),
		// 窗口脚本
		popup: path.resolve(__dirname, "..", "src", "popup.ts"),
		// 选项页脚本
		options: path.resolve(__dirname, "..", "src", "options.ts"),
		// 统计页脚本
		statistics: path.resolve(__dirname, "..", "src/statistics/", "statistics.ts"),
		// 公众号阅读页脚本
		mp: path.resolve(__dirname, "..", "src/mpwx/", "mp.ts"),
		// 沙箱脚本
		sandbox: path.resolve(__dirname, "..", "src/sandbox", "sandbox.ts"),
		// service worker
		worker: path.resolve(__dirname, "..", "src", "worker.ts")
	},

	// 配置输出
	output: {
		// 打包路径（打包后的文件在哪）
		path: path.resolve(__dirname, '../dist'),
		// 打包后的文件名（使用文件本身的名字）
		filename: "[name].js"
	},

	// 设置模块如何被解析
	resolve: {
		// ts 和 js 文件可以作为模块使用
		extensions: [".ts", ".js", ".tsx"],
	},

	// 指定打包时要使用的模块
	module: {
		// 指定加载规则
		rules: [
			{
				// 指定使规则生效的文件
				test: /\.tsx?$/i,
				// 指定要使用的 loader
				use: [
					babelLoader,
					// 'babel-loader',
					'ts-loader'
				],
				// 指定要排除的文件
				exclude: /node-modules/
			},

			// 设置 less 文件的处理
			{
				test: /\.less$/i,
				use: lessLoaders
			},

			// 设置 css 文件的处理
			{
				test: /\.css$/i,
				use: cssLoaders
			},

			// 设置替换字符串 https://www.npmjs.com/package/string-replace-loader
			{
				test: /worker-vars.ts$/,
				loader: 'string-replace-loader',
				options: {
					search: /__metaTemplate__/ig,
					replace: ()=>{
						return fs.readFileSync(path.resolve(__dirname, '../public/template/notebookTemplate.njk')).toString('utf8')
					}
				}
			}
		]
	},

	// 配置插件
	plugins: [
		// CleanWebpackPlugin 用来在打包前清空打包文件夹
		new CleanWebpackPlugin(),
		// CopyPlugin 用来复制文件到指定位置
		new CopyPlugin({
			patterns: [
				// from 相对于 context
				// to 相对于编译文件夹
				{from: "manifest.json", to: ".", context: "public"},
				{from: "extension-icons", to: "./icons/extension-icons", context: "public"},
				{from: "content/static/css", to: "./content/static/css", context: "src"},
				{from: "options.css", to: ".", context: "src/options"},
				{from: "statistics.css", to: ".", context: "src/statistics"},
				{from: "icons", to: "./icons/options-icons", context: "src/options"}
			]
		}),
		new HTMLWebpackPlugin({
			filename: 'popup.html',
			template: 'src/popup/popup.html',
			// 将 scripts 放到 body 末尾
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			// 要引入到 HTML 中的打包好的 js 脚本
			chunks: ['popupPage', 'popup']
		}),
		new HTMLWebpackPlugin({
			filename: 'statistics.html',
			template: 'src/statistics/statistics.html',
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			chunks: ['statistics']
		}),
		new HTMLWebpackPlugin({
			filename: 'mp.html',
			template: 'src/mpwx/mp.html',
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			chunks: ['mp']
		}),
		new HTMLWebpackPlugin({
			filename: 'options.html',
			template: 'src/options/options.html',
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			chunks: ['options']
		}),
		new HTMLWebpackPlugin({
			filename: 'offscreen.html',
			template: 'src/offscreen/offscreen.html',
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			chunks: ['offscreen']
		}),
		new HTMLWebpackPlugin({
			filename: 'sandbox.html',
			template: 'src/sandbox/sandbox.html',
			inject: 'body',
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			chunks: ['sandbox']
		}),
	]
}