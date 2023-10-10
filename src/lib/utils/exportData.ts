import { collections } from '../server/database';

export async function exportDatabase() {
	const cart = await collections.carts.find();

	return cart;
}
