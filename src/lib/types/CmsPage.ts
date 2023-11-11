import type { Timestamps } from './Timestamps';

export interface CMSPage extends Timestamps {
	_id: string;
	title: string;
	shortDescription: string;
	content: string;
	fullScreen: boolean;
	maintenanceDisplay: boolean;
}

export const MAX_CONTENT_LIMIT = 20000;
