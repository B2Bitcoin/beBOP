import type { Timestamps } from './Timestamps';
import type { Paths } from 'type-fest';

interface ColorChoice {
	dark: string;
	light: string;
}
export interface StyleHeader {
	backgroundColor: ColorChoice;
	shopName: {
		color: ColorChoice;
		fontFamily: string;
	};
	tab: {
		color: ColorChoice;
		fontFamily: string;
	};
	activeTab: {
		textDecoration: {
			color: ColorChoice;
		};
	};
}

export interface StyleNavbar {
	backgroundColor: ColorChoice;
	fontFamily: string;
	color: ColorChoice;
	searchInput: {
		backgroundColor: ColorChoice;
	};
}

export interface StyleFooter {
	backgroundColor: ColorChoice;
	fontFamily: string;
	color: ColorChoice;
}

export interface StyleCartPreview {
	backgroundColor: ColorChoice;
	fontFamily: string;
	color: ColorChoice;
	cta: {
		fontFamily: string;
	};
	mainCTA: {
		backgroundColor: ColorChoice;
		color: ColorChoice;
	};
	secondaryCTA: {
		backgroundColor: ColorChoice;
		color: ColorChoice;
	};
}

export interface StyleBody {
	secondPlan: {
		backgroundColor: ColorChoice;
	};
	mainPlan: {
		backgroundColor: ColorChoice;
	};
	title: {
		fontFamily: string;
		color: ColorChoice;
	};
	text: {
		fontFamily: string;
		color: ColorChoice;
	};
	secondaryText: {
		fontFamily: string;
		color: ColorChoice;
	};
	cta: {
		fontFamily: string;
	};
	mainCTA: {
		backgroundColor: ColorChoice;
		color: ColorChoice;
	};
	secondaryCTA: {
		backgroundColor: ColorChoice;
		color: ColorChoice;
	};

	hyperlink: {
		color: ColorChoice;
	};
}

export interface StyleTagWidget {
	main: {
		backgroundColor: ColorChoice;
	};
	transparent: {
		backgroundColor: ColorChoice;
	};
	secondary: {
		backgroundColor: ColorChoice;
	};
	cta: {
		backgroundColor: ColorChoice;
		color: ColorChoice;
	};
	fontFamily: string;
	color: ColorChoice;
	hyperlink: {
		color: ColorChoice;
	};
}

export interface Theme extends Timestamps {
	_id: string;
	name: string;
	header: StyleHeader;
	navbar: StyleNavbar;
	footer: StyleFooter;
	cartPreview: StyleCartPreview;
	body: StyleBody;
	tagWidget: StyleTagWidget;
}

export const themeFormStructure = {
	header: {
		label: 'Top bar',
		elements: [
			{ label: 'Background color', name: 'backgroundColor' },
			{
				label: 'Shop name font',
				name: 'shopName.fontFamily'
			},
			{
				label: 'Tab font',
				name: 'tab.fontFamily'
			},
			{
				label: 'Shop name font color',
				name: 'shopName.color'
			},
			{ label: 'Tab font color', name: 'tab.color' },
			{
				label: 'Active tab underline color',
				name: 'activeTab.textDecoration.color'
			}
		]
	},
	navbar: {
		label: 'Navigation bar',
		elements: [
			{ label: 'Background color', name: 'backgroundColor' },
			{ label: 'Font', name: 'fontFamily' },
			{ label: 'Font color', name: 'color' },
			{
				label: 'Search input background color',
				name: 'searchInput.backgroundColor'
			}
		]
	},
	footer: {
		label: 'Footer',
		elements: [
			{ label: 'Background color', name: 'backgroundColor' },
			{ label: 'Font', name: 'fontFamily' },
			{ label: 'Font color', name: 'color' }
		]
	},
	cartPreview: {
		label: 'Cart preview',
		elements: [
			{ label: 'Background color', name: 'backgroundColor' },
			{
				label: 'Main CTA background color',
				name: 'mainCTA.backgroundColor'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTA.backgroundColor'
			},
			{ label: 'Font', name: 'fontFamily' },
			{ label: 'Font color', name: 'color' },
			{
				label: 'CTA Font',
				name: 'cta.fontFamily'
			},
			{
				label: 'Main CTA font color',
				name: 'mainCTA.color'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTA.color'
			}
		]
	},
	body: {
		label: 'Body',
		elements: [
			{
				label: 'Second plan background color',
				name: 'secondPlan.backgroundColor'
			},
			{
				label: 'Main background color',
				name: 'mainPlan.backgroundColor'
			},
			{
				label: 'Title font',
				name: 'title.fontFamily'
			},
			{ label: 'Title font color', name: 'title.color' },
			{
				label: 'Text font',
				name: 'text.fontFamily'
			},
			{ label: 'Text font color', name: 'text.color' },
			{
				label: 'Secondary text font',
				name: 'secondaryText.fontFamily'
			},
			{
				label: 'Secondary text font color',
				name: 'secondaryText.color'
			},
			{
				label: 'Main CTA background color',
				name: 'mainCTA.backgroundColor'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTA.backgroundColor'
			},
			{
				label: 'CTA Font',
				name: 'cta.fontFamily'
			},
			{
				label: 'Main CTA font color',
				name: 'mainCTA.color'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTA.color'
			},
			{ label: 'Hyperlink color', name: 'hyperlink.color' }
		]
	},
	tagWidget: {
		label: 'Tag widgets',
		elements: [
			{
				label: 'Main background color',
				name: 'main.backgroundColor'
			},
			{
				label: 'Transparent background color',
				name: 'transparent.backgroundColor'
			},
			{
				label: 'Secondary background color',
				name: 'secondary.backgroundColor'
			},
			{
				label: 'CTA background color',
				name: 'cta.backgroundColor'
			},
			{ label: 'Font', name: 'fontFamily' },
			{ label: 'Font color', name: 'color' },
			{ label: 'CTA font color', name: 'cta.color' },
			{ label: 'Hyperlink color', name: 'hyperlink.color' }
		]
	}
} satisfies {
	[key in keyof Omit<Theme, '_id' | keyof Timestamps | 'name'>]: {
		label: string;
		elements: {
			label: string;
			name: Paths<Theme[key]>;
		}[];
	};
};

export const systemFonts = [
	'Arial',
	'Verdana',
	'Helvetica',
	'Tahoma',
	'Trebuchet MS',
	'Times New Roman',
	'Georgia',
	'Garamond',
	'Courier New',
	'Brush Script MT',
	'Outfit',
	'Gloock',
	'Poppins'
];

export type StyleFormStructure = typeof themeFormStructure;
