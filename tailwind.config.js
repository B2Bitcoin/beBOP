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
			gray: {
				50: '#FAFAFA',
				100: '#F6F6F6',
				200: '#F0F0F0',
				250: '#ECECEC',
				350: '#DDDDDD',
				400: '#D9D9D9',
				420: '#D3D3D3',
				450: '#CFCFCF',
				600: '#747474',
				700: '#656565',
				800: '#4A4A4A',
				850: '#292929'
			}
		},
		fontFamily: {
			display: ['Gloock', 'ui-serif'],
			body: ['Outfit', 'ui-sans-serif'],
		}
	},
	/* To style checkboxes with form-checkbox */
	plugins: [require('@tailwindcss/forms')]
};
