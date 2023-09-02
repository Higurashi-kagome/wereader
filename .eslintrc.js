module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	ignorePatterns: [
		'node_modules/',
		'dist/',
		'public/',
		'webpack/',
		'res/',
		'scripts/',
		'.eslintrc.js'
	],
	rules: {
		// 添加你的规则
	}
};