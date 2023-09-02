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
		"no-case-declarations": "off",
		'indent': ['error', 'tab'],
		"no-mixed-spaces-and-tabs": "error",
		'space-before-function-paren': ['error', {
			"anonymous": "never",
			"named": "never",
			"asyncArrow": "always"
		}],
		"space-before-blocks": ['error', {
				'functions': 'always',
				"classes": "always"
			}
		],
		'arrow-spacing': ['error', { 'before': true, 'after': true }],
		'semi': ['error', 'never']
	}
};