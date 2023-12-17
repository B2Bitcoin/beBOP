import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';

export interface Lock extends Timestamps {
	_id: string;
	ownerId: ObjectId;
	// In dev mode, ownerId doesn't change across hot reloads so we use an additional var.
	instanceId: ObjectId;
}
