import type { Timestamps } from './Timestamps';

export interface ImageData {
	key: string;
	width: number;
	height: number;
	size: number;
}

export interface Picture extends Timestamps {
	_id: string;
	productId?: string;
	name: string;

	storage: {
		original: ImageData;
		formats: ImageData[];
	};
}

export const DEFAULT_LOGO = 'https://coyo.dev/icons/logo.png';
