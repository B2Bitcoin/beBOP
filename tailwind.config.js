const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		colors: {
			white: colors.white,
			black: colors.black,
			blue: colors.blue,
			red: colors.red,
			green: colors.green,
			yellow: colors.yellow,
			gray: {
				50: '#FAFAFA',
				100: '#F6F6F6',
				200: '#F0F0F0',
				240: '#EDEDED',
				250: '#ECECEC',
				300: '#E6E6E6',
				350: '#DDDDDD',
				400: '#D9D9D9',
				420: '#D3D3D3',
				450: '#CFCFCF',
				550: '#8D8D8D',
				600: '#747474',
				700: '#656565',
				800: '#4A4A4A',
				850: '#292929'
			}
		},
		fontFamily: {
			display: ['Gloock', 'ui-serif'],
			body: ['Outfit', 'ui-sans-serif']
		}
	},
	/* To style checkboxes with form-checkbox */
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};
