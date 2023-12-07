import type { OrderAddress } from '$lib/types/Order';
import { countryNameByAlpha2 } from './country-codes';

export function textAddress(address: OrderAddress) {
	return `${address.firstName || ''} ${address.lastName || ''}\n${address.address || ''}\n${
		address.zip || ''
	} ${address.city || ''}\n${countryNameByAlpha2[address.country] || ''}`
		.trim()
		.replace(/\n+/g, '\n')
		.replace(/ +/g, ' ');
}
