import type { Timestamps } from './Timestamps';

interface StyleHeader {
	backgroundColor: {
		dark: string;
		light: string;
	};
	shopNameFont: string;
	tabFont: string;
	shopNameFontColor: {
		dark: string;
		light: string;
	};
	tabFontColor: {
		dark: string;
		light: string;
	};
	activeTabUnderlineColor: {
		dark: string;
		light: string;
	};
}

interface StyleNavbar {
	backgroundColor: {
		dark: string;
		light: string;
	};
	font: string;
	fontColor: {
		dark: string;
		light: string;
	};
	searchInputBackgroundColor: {
		dark: string;
		light: string;
	};
}

interface StyleFooter {
	backgroundColor: {
		dark: string;
		light: string;
	};
	font: string;
	fontColor: {
		dark: string;
		light: string;
	};
}

interface StyleCartPreview {
	backgroundColor: {
		dark: string;
		light: string;
	};
	mainCTABackgroundColor: {
		dark: string;
		light: string;
	};
	secondaryCTABackgroundColor: {
		dark: string;
		light: string;
	};
	font: string;
	fontColor: {
		dark: string;
		light: string;
	};
	CTAFont: string;
	mainCTAFontColor: {
		dark: string;
		light: string;
	};
	secondaryCTAFontColor: {
		dark: string;
		light: string;
	};
}

interface StyleBody {
	secondPlanBackgroundColor: {
		dark: string;
		light: string;
	};
	mainBackgroundColor: {
		dark: string;
		light: string;
	};
	titleFont: string;
	titleFontColor: {
		dark: string;
		light: string;
	};
	textFont: string;
	textFontColor: {
		dark: string;
		light: string;
	};
	secondaryTextFont: string;
	secondaryTextFontColor: {
		dark: string;
		light: string;
	};
	mainCTABackgroundColor: {
		dark: string;
		light: string;
	};
	secondaryCTABackgroundColor: {
		dark: string;
		light: string;
	};
	CTAFont: string;
	mainCTAFontColor: {
		dark: string;
		light: string;
	};
	secondaryCTAFontColor: {
		dark: string;
		light: string;
	};
	hyperlinkColor: {
		dark: string;
		light: string;
	};
}

interface StyleTagWidget {
	mainBackgroundColor: {
		dark: string;
		light: string;
	};
	transparentBackgroundColor: {
		dark: string;
		light: string;
	};
	secondaryBackgroundColor: {
		dark: string;
		light: string;
	};
	CTAbackgroundColor: {
		dark: string;
		light: string;
	};
	font: string;
	fontColor: {
		dark: string;
		light: string;
	};
	CTAFontColor: {
		dark: string;
		light: string;
	};
	hyperlinkColor: {
		dark: string;
		light: string;
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
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Shop name font',
				name: 'shopNameFont',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{ label: 'Tab font', name: 'tabFont', isColor: false, placeholder: 'Arial, sans-serif' },
			{
				label: 'Shop name font color',
				name: 'shopNameFontColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Tab font color', name: 'tabFontColor', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Active tab underline color',
				name: 'activeTabUnderlineColor',
				isColor: true,
				placeholder: 'FFFFFF'
			}
		]
	},
	navbar: {
		label: 'Navigation bar',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Font', name: 'font', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'fontColor', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Search input background color',
				name: 'searchInputBackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			}
		]
	},
	footer: {
		label: 'Footer',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Font', name: 'font', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'fontColor', isColor: true, placeholder: 'FFFFFF' }
		]
	},
	cartPreview: {
		label: 'Cart preview',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Main CTA background color',
				name: 'mainCTABackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTABackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Font', name: 'font', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'fontColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'CTA Font', name: 'CTAFont', isColor: false, placeholder: 'Arial, sans-serif' },
			{
				label: 'Main CTA font color',
				name: 'mainCTAFontColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTAFontColor',
				isColor: true,
				placeholder: 'FFFFFF'
			}
		]
	},
	body: {
		label: 'Body',
		elements: [
			{
				label: '2nd plan background color',
				name: 'secondPlanBackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Main background color',
				name: 'mainBackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Title font', name: 'titleFont', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Title font color', name: 'titleFontColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Text font', name: 'textFont', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Text font color', name: 'textFontColor', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Secondary text font',
				name: 'secondaryTextFont',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{
				label: 'Secondary text font color',
				name: 'secondaryTextFontColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Main CTA background color',
				name: 'mainCTABackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTABackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'CTA Font', name: 'CTAFont', isColor: false, placeholder: 'Arial, sans-serif' },
			{
				label: 'Main CTA font color',
				name: 'mainCTAFontColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTAFontColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Hyperlink color', name: 'hyperlinkColor', isColor: true, placeholder: 'FFFFFF' }
		]
	},
	tagWidget: {
		label: 'Tag widgets',
		elements: [
			{
				label: 'Main background color',
				name: 'mainBackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Transparent background color',
				name: 'transparentBackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary background color',
				name: 'secondaryBackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'CTA background color',
				name: 'CTAbackgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Font', name: 'font', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'fontColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'CTA font color', name: 'CTAFontColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Hyperlink color', name: 'hyperlinkColor', isColor: true, placeholder: 'FFFFFF' }
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
	'Brush Script MT'
];

export type StyleFormStructure = typeof styleFormStructure;
