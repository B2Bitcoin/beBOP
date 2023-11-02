// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		colors: {
			white: colors.white,
			black: colors.black,
			blue: colors.blue,
			link: '#2271B1',
			red: colors.red,
			green: colors.green,
			yellow: colors.yellow,
			transparent: colors.transparent,
			gray: {
				40: '#FBFBFB',
				50: '#FAFAFA',
				75: '#F9F9F9',
				100: '#F6F6F6',
				190: '#F1F1F1',
				200: '#F0F0F0',
				240: '#EDEDED',
				250: '#ECECEC',
				300: '#E6E6E6',
				350: '#DDDDDD',
				360: '#DCDCDC',
				400: '#D9D9D9',
				420: '#D3D3D3',
				450: '#CFCFCF',
				550: '#8D8D8D',
				600: '#747474',
				700: '#656565',
				800: '#4A4A4A',
				850: '#292929'
			},
			jagger: {
				200: '#efd8fc',
				500: '#c160ec',
				700: '#982ec2',
				900: '#67247f'
			},
			rosebudcherry: {
				200: '#ffcbe9',
				500: '#fa3a9c',
				700: '#cc0a5e'
			},
			roseofsharon: {
				200: '#ffe984',
				500: '#ffa000',
				700: '#c25300'
			}
		},
		fontFamily: {
			display: ['Gloock', 'ui-serif'],
			body: ['Outfit', 'ui-sans-serif'],
			btn: ['Poppins', 'ui-sans-serif']
		}
	},
	/* To style checkboxes with form-checkbox */
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography'), require('flowbite/plugin')]
};
