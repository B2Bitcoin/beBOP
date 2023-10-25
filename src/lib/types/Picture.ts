import type { Timestamps } from './Timestamps';
export const TAGTYPES = ['main', 'full', 'wide', 'slim', 'avatar'] as const;
export type TagType = (typeof TAGTYPES)[number];

export interface ImageData {
	key: string;
	width: number;
	height: number;
	size: number;
}

export interface Picture extends Timestamps {
	_id: string;
	productId?: string;
	tag?: {
		_id: string;
		type: 'main' | 'full' | 'wide' | 'slim' | 'avatar';
	};
	name: string;

	storage: {
		original: ImageData;
		formats: ImageData[];
	};
}

export const DEFAULT_LOGO = 'https://coyo.dev/icons/logo.png';
