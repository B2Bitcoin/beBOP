import type { Timestamps } from './Timestamps';

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
	cta: ColorChoice;
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

export interface Style extends Timestamps {
	_id: string;
	name: string;
	header: StyleHeader;
	navbar: StyleNavbar;
	footer: StyleFooter;
	cartPreview: StyleCartPreview;
	body: StyleBody;
	tagWidget: StyleTagWidget;
}

export const styleFormStructure = {
	header: {
		label: 'Top bar',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'Shop name font',
				name: 'shopName.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{
				label: 'Tab font',
				name: 'tab.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{
				label: 'Shop name font color',
				name: 'shopName.color',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{ label: 'Tab font color', name: 'tab.color', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'Active tab underline color',
				name: 'activeTab.textDecoration.color',
				isColor: true,
				placeholder: '#FFFFFF'
			}
		]
	},
	navbar: {
		label: 'Navigation bar',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: '#FFFFFF' },
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'Search input background color',
				name: 'searchInput.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			}
		]
	},
	footer: {
		label: 'Footer',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: '#FFFFFF' },
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: '#FFFFFF' }
		]
	},
	cartPreview: {
		label: 'Cart preview',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'Main CTA background color',
				name: 'mainCTA.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTA.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'CTA Font',
				name: 'cta.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{
				label: 'Main CTA font color',
				name: 'mainCTA.color',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTA.color',
				isColor: true,
				placeholder: '#FFFFFF'
			}
		]
	},
	body: {
		label: 'Body',
		elements: [
			{
				label: 'Second plan background color',
				name: 'secondPlan.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Main background color',
				name: 'mainPlan.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Title font',
				name: 'title.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{ label: 'Title font color', name: 'title.color', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'Text font',
				name: 'text.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{ label: 'Text font color', name: 'text.color', isColor: true, placeholder: '#FFFFFF' },
			{
				label: 'Secondary text font',
				name: 'secondaryText.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{
				label: 'Secondary text font color',
				name: 'secondaryText.color',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Main CTA background color',
				name: 'mainCTA.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTA.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'CTA Font',
				name: 'cta.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{
				label: 'Main CTA font color',
				name: 'mainCTA.color',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTA.color',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{ label: 'Hyperlink color', name: 'hyperlink.color', isColor: true, placeholder: '#FFFFFF' }
		]
	},
	tagWidget: {
		label: 'Tag widgets',
		elements: [
			{
				label: 'Main background color',
				name: 'main.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Transparent background color',
				name: 'transparent.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'Secondary background color',
				name: 'secondary.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{
				label: 'CTA background color',
				name: 'cta.backgroundColor',
				isColor: true,
				placeholder: '#FFFFFF'
			},
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: '#FFFFFF' },
			{ label: 'CTA font color', name: 'cta.color', isColor: true, placeholder: '#FFFFFF' },
			{ label: 'Hyperlink color', name: 'hyperlink.color', isColor: true, placeholder: '#FFFFFF' }
		]
	}
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

export type StyleFormStructure = typeof styleFormStructure;
('Outfit');
