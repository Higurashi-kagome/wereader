module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [// https://www.npmjs.com/package/eslint-config-airbnb-base
        'airbnb-base/legacy'],
    ignorePatterns: ['node_modules/', 'dist/', 'public/', 'webpack/', 'res/', 'scripts/', '.eslintrc.js', 'options-help.ts'],
    'globals': {
        'chrome': 'readonly',
        'JQuery': 'readonly'
    },
    rules: {
        'no-case-declarations': 'off', // case 语句中声明
        'indent': ['error', 4], // 缩进
        'no-mixed-spaces-and-tabs': 'error', // tab 空格混用
        'strict': ['error', 'never'], // 严格模式
        'no-param-reassign': 'off', // 给参数赋值
        'no-underscore-dangle': 'off', // 下划线变量
        'no-plusplus': 'off', // i++
        'radix': 'off', // parseInt 进制
        'no-alert': 'off', // alert
        'semi': ['error', 'never'], // 分号
        "no-shadow": "off",
    }
}
