import { describe, expect, it } from 'vitest';
import { orderAddressLabel } from './bitcoind';
import { ObjectId } from 'mongodb';
// import { bip84Address } from './bitcoin';

describe('bitcoin', () => {
	// dummy test so vitest doesn't complain
	it('should have labels', () => {
		expect(orderAddressLabel('orderId', new ObjectId('6577739b4feec6c5137a2202'))).toBe(
			'order:orderId:6577739b4feec6c5137a2202'
		);
	});
});
