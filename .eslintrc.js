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
		'.eslintrc.js',
		'options-help.ts'
	],
	rules: {
		// 添加你的规则
		"@typescript-eslint/ban-types": "warn",
		"no-case-declarations": "off"
	}
};