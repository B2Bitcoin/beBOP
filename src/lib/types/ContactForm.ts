import type { Timestamps } from './Timestamps';

export interface ContactForm extends Timestamps {
	_id: string;
	title: string;
	content: string;
	target: string;
}
