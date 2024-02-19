import type { ObjectId } from 'mongodb';
import type { Timestamps } from './Timestamps';
import type { CountryAlpha2 } from './Country';

export interface VatProfile extends Timestamps {
	_id: ObjectId;
	name: string;

	rates: Partial<Record<CountryAlpha2, number>>;
}
