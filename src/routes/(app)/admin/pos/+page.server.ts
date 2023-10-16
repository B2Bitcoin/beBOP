import { collections } from '$lib/server/database';

export async function load() {
	const seats = await collections.seats.find();

	return {
		seats: seats.toArray()
	};
}
