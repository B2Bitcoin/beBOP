import type { Timestamps } from './Timestamps';

export interface Role extends Timestamps {
	_id: string;
	name: string;

	permissions: {
		read: string[];
		write: string[];
		forbidden: string[];
	};
}
