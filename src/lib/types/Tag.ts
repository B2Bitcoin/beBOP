import type { Currency } from './Currency';
import type { DeliveryFees } from './DeliveryFees';
import type { Timestamps } from './Timestamps';

export interface Tag extends Timestamps {
	_id: string;
	name: string;
	title: string;
	subtitle: string;
	content: string;
	shortContent: string;
	family: 'creators' | 'events' | 'retailers' | 'temporal';
	widgetUseOnly: boolean;
	productTagging: boolean;
	useLightDark: boolean;
	cssOveride: string;
	cta: {
		label: string;
		href: string;
	}[];
	menu: {
		label: string;
		href: string;
	}[];
}
