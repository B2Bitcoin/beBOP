import type { ObjectId } from 'mongodb';
import type { CountryAlpha2 } from './Country';
import type { UserIdentifier } from './UserIdentifier';

export interface PersonalInfo {
	_id: ObjectId;
	user: UserIdentifier;
	firstName: string;
	lastName: string;
	address: {
		street: string;
		zip: string;
		city: string;
		country: CountryAlpha2;
		state?: string;
	};
}
