import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Lock extends Timestamps {
	_id: string;
	ownerId: ObjectId;
}
