import { collections } from '$lib/server/database.js';
import type { Product } from '$lib/types/Product.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const ticketId = event.params.id;

	const ticket = await collections.tickets.findOne({ _id: ticketId });

	if (!ticket) {
		throw error(404, 'Ticket not found');
	}

	const product = await collections.products.findOne<Pick<Product, 'name' | '_id'>>(
		{ _id: ticket.productId },
		{
			projection: {
				name: { $ifNull: [`$translations.${event.locals.language}.name`, '$name'] }
			}
		}
	);

	if (!product) {
		throw error(404, 'Event associated to ticket not found');
	}

	const picture = await collections.pictures.findOne(
		{
			productId: ticket.productId
		},
		{
			sort: { createdAt: 1 }
		}
	);

	return {
		ticket: {
			_id: ticket._id,
			createdAt: ticket.createdAt,
			scanned: ticket.scanned && {
				at: ticket.scanned.at
			}
		},
		product,
		picture
	};
}
