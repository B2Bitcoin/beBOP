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
	// All because of `parserOptions.project`
	ignorePatterns: ['*.cjs', '*.js', 'playwrite.config.ts', 'scripts'],
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
		ecmaVersion: 2020,
		project: 'tsconfig.json',
		extraFileExtensions: ['.svelte']
	},
	rules: {
		'no-empty': 'off',
		eqeqeq: 'error',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-non-null-assertion': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/switch-exhaustiveness-check': 'error',
		curly: 'error'
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
