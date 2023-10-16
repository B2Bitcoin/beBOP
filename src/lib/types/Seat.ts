import type { Timestamps } from './Timestamps';

export interface Seat extends Timestamps {
	_id: string;
	login: string;
	password: string;
}
