import type { Timestamps } from './Timestamps';

export interface CMSPage extends Timestamps {
	_id: string;
	title: string;
	shortDescription: string;
	content: string;
	fullScreen: boolean;
	maintenanceDisplay: boolean;
}

export type CmsToken =
	| {
			type: 'html';
			raw: string;
	  }
	| {
			type: 'productWidget';
			slug: string;
			display: string | undefined;
			raw: string;
	  }
	| {
			type: 'challengeWidget';
			slug: string;
			raw: string;
	  }
	| {
			type: 'sliderWidget';
			slug: string;
			autoplay: number | undefined;
			raw: string;
	  }
	| {
			type: 'tagWidget';
			slug: string;
			display: string | undefined;
			raw: string;
	  };

export const MAX_CONTENT_LIMIT = 20000;
