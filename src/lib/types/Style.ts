import type { Timestamps } from './Timestamps';

export interface StyleHeader {
	backgroundColor: {
		dark: string;
		light: string;
	};
	shopName: {
		color: {
			dark: string;
			light: string;
		};
		fontFamily: string;
	};
	tab: {
		color: {
			dark: string;
			light: string;
		};
		fontFamily: string;
	};
	activeTabUnderline: {
		color: {
			dark: string;
			light: string;
		};
	};
}

export interface StyleNavbar {
	backgroundColor: {
		dark: string;
		light: string;
	};
	fontFamily: string;
	color: {
		dark: string;
		light: string;
	};
	searchInput: {
		backgroundColor: {
			dark: string;
			light: string;
		};
	};
}

export interface StyleFooter {
	backgroundColor: {
		dark: string;
		light: string;
	};
	fontFamily: string;
	color: {
		dark: string;
		light: string;
	};
}

export interface StyleCartPreview {
	backgroundColor: {
		dark: string;
		light: string;
	};
	fontFamily: string;
	color: {
		dark: string;
		light: string;
	};
	cta: {
		fontFamily: string;
	};
	mainCTA: {
		backgroundColor: {
			dark: string;
			light: string;
		};
		color: {
			dark: string;
			light: string;
		};
	};
	secondaryCTA: {
		backgroundColor: {
			dark: string;
			light: string;
		};
		color: {
			dark: string;
			light: string;
		};
	};
}

export interface StyleBody {
	secondPlan: {
		backgroundColor: {
			dark: string;
			light: string;
		};
	};
	mainPlan: {
		backgroundColor: {
			dark: string;
			light: string;
		};
	};
	title: {
		fontFamily: string;
		color: {
			dark: string;
			light: string;
		};
	};
	text: {
		fontFamily: string;
		color: {
			dark: string;
			light: string;
		};
	};
	secondaryText: {
		fontFamily: string;
		color: {
			dark: string;
			light: string;
		};
	};
	cta: {
		fontFamily: string;
	};
	mainCTA: {
		backgroundColor: {
			dark: string;
			light: string;
		};
		color: {
			dark: string;
			light: string;
		};
	};
	secondaryCTA: {
		backgroundColor: {
			dark: string;
			light: string;
		};
		color: {
			dark: string;
			light: string;
		};
	};

	hyperlink: {
		color: {
			dark: string;
			light: string;
		};
	};
}

export interface StyleTagWidget {
	main: {
		backgroundColor: {
			dark: string;
			light: string;
		};
	};
	transparent: {
		backgroundColor: {
			dark: string;
			light: string;
		};
	};
	secondary: {
		backgroundColor: {
			dark: string;
			light: string;
		};
	};
	cta: {
		backgroundColor: {
			dark: string;
			light: string;
		};
		color: {
			dark: string;
			light: string;
		};
	};
	fontFamily: string;
	color: {
		dark: string;
		light: string;
	};
	hyperlink: {
		color: {
			dark: string;
			light: string;
		};
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
				placeholder: 'FFFFFF'
			},
			{ label: 'Tab font color', name: 'tab.color', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Active tab underline color',
				name: 'activeTabUnderline.color',
				isColor: true,
				placeholder: 'FFFFFF'
			}
		]
	},
	navbar: {
		label: 'Navigation bar',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Search input background color',
				name: 'searchInput.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			}
		]
	},
	footer: {
		label: 'Footer',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: 'FFFFFF' }
		]
	},
	cartPreview: {
		label: 'Cart preview',
		elements: [
			{ label: 'Background color', name: 'backgroundColor', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Main CTA background color',
				name: 'mainCTA.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTA.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: 'FFFFFF' },
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
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTA.color',
				isColor: true,
				placeholder: 'FFFFFF'
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
				placeholder: 'FFFFFF'
			},
			{
				label: 'Main background color',
				name: 'mainPlan.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Title font',
				name: 'title.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{ label: 'Title font color', name: 'title.color', isColor: true, placeholder: 'FFFFFF' },
			{
				label: 'Text font',
				name: 'text.fontFamily',
				isColor: false,
				placeholder: 'Arial, sans-serif'
			},
			{ label: 'Text font color', name: 'text.color', isColor: true, placeholder: 'FFFFFF' },
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
				placeholder: 'FFFFFF'
			},
			{
				label: 'Main CTA background color',
				name: 'mainCTA.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA background color',
				name: 'secondaryCTA.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
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
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary CTA font color',
				name: 'secondaryCTA.color',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Hyperlink color', name: 'hyperlink.color', isColor: true, placeholder: 'FFFFFF' }
		]
	},
	tagWidget: {
		label: 'Tag widgets',
		elements: [
			{
				label: 'Main background color',
				name: 'main.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Transparent background color',
				name: 'transparent.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'Secondary background color',
				name: 'secondary.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{
				label: 'CTA background color',
				name: 'cta.backgroundColor',
				isColor: true,
				placeholder: 'FFFFFF'
			},
			{ label: 'Font', name: 'fontFamily', isColor: false, placeholder: 'Arial, sans-serif' },
			{ label: 'Font color', name: 'color', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'CTA font color', name: 'cta.color', isColor: true, placeholder: 'FFFFFF' },
			{ label: 'Hyperlink color', name: 'hyperlink.color', isColor: true, placeholder: 'FFFFFF' }
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
