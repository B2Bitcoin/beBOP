import type { ObjectId } from 'mongodb';
import type { Order } from './Order';
import type { Product } from './Product';
import type { Timestamps } from './Timestamps';
import type { User } from './User';
import type { UserIdentifier } from './UserIdentifier';

export interface Ticket extends Timestamps {
	_id: ObjectId;

	/** Secure crypto random uuid */
	ticketId: string;
	orderId: Order['_id'];
	productId: Product['_id'];

	user: UserIdentifier;

	scanned?: {
		at: Date;
		by: {
			_id: User['_id'];
			login: User['login'];
			role: User['roleId'];
		};
	};
}
