import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Migration extends Timestamps {
	_id: ObjectId;
	name: string;
}
