module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:svelte/recommended',
		'plugin:svelte/prettier',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	plugins: ['svelte', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	rules: {
		'no-empty': 'off',
		eqeqeq: 'error',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-non-null-assertion': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		curly: 'error'
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
