import type { Timestamps } from './Timestamps';

export interface DigitalFile extends Timestamps {
	_id: string;
	productId: string;
	name: string;
	storage: {
		key: string;
		size: number;
		url?: string;
	};
}
