import type { Timestamps } from './Timestamps';

export interface NostRNotification extends Timestamps {
	content: string;
	dest: string;
}
