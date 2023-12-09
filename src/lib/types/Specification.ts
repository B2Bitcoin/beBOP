import type { Timestamps } from './Timestamps';

export interface Specification extends Timestamps {
	_id: string;
	title: string;
	content: string;
}
