import { collections } from '$lib/server/database.js';
import type { Cart } from '$lib/types/Cart.js';
import type { Order } from '$lib/types/Order.js';
import { error } from '@sveltejs/kit';
import type { ChangeStream, ChangeStreamDocument, ObjectId } from 'mongodb';
import { formatCart, formatOrder } from '../formatCartOrder.js';

export async function GET({ locals }) {
	const userId = locals.user?._id;
	if (!userId) {
		throw error(401, 'Must be logged in');
	}

	const { readable, writable } = new TransformStream();
	let writer: WritableStreamDefaultWriter<unknown> | null = writable.getWriter();

	function cleanup() {
		writer?.close();
		writer = null;
		cartChangeStream?.close().catch(console.error);
		cartChangeStream = null;
		orderChangeStream?.close().catch(console.error);
		orderChangeStream = null;
	}

	let ownCartId: ObjectId | null = null;

	//Check change on cart collection
	const cartCollection = collections.carts;
	let cartChangeStream: ChangeStream<Cart, ChangeStreamDocument<Cart>> | null =
		cartCollection.watch(
			[
				{
					$match: {
						$or: [
							{
								'fullDocument.user.userId': userId
							},
							{
								operationType: 'delete'
							}
						]
					}
				}
			],
			{
				fullDocument: 'updateLookup'
			}
		);

	cartChangeStream.on('change', async (changeEvent) => {
		if (!writer) {
			return;
		}
		const deletedOwnCart =
			changeEvent.operationType === 'delete' &&
			ownCartId &&
			changeEvent.documentKey._id.equals(ownCartId);
		const ownCart =
			'fullDocument' in changeEvent &&
			changeEvent.fullDocument &&
			changeEvent.fullDocument.user.userId?.equals(userId) &&
			changeEvent.fullDocument;
		if (!deletedOwnCart && !ownCart) {
			return;
		}
		if (ownCart) {
			ownCartId = ownCart._id;
		}
		try {
			const formattedCart = await formatCart(ownCart || null, locals);
			await writer?.ready;
			await writer?.write(
				`data: ${JSON.stringify({ eventType: 'cart', cart: formattedCart })}\n\n`
			);
		} catch (error) {
			// Error writing to the client, assume it has disconnected
			cleanup();
		}
	});

	// Check change on order collection
	const orderCollection = collections.orders;
	let orderChangeStream: ChangeStream<Order, ChangeStreamDocument<Order>> | null =
		orderCollection.watch(
			[
				{
					$match: {
						'fullDocument.user.userId': userId
					}
				}
			],
			{
				fullDocument: 'updateLookup'
			}
		);

	orderChangeStream.on('change', async (changeEvent) => {
		if (!writer) {
			return;
		}
		try {
			const order =
				'fullDocument' in changeEvent && changeEvent.fullDocument
					? formatOrder(changeEvent.fullDocument)
					: null;

			await writer?.ready;
			await writer?.write(`data: ${JSON.stringify({ eventType: 'order', order })}\n\n`);
		} catch (error) {
			console.error('Error processing order changeEvent:', error);
			// Error writing to the client, assume it has disconnected
			cleanup();
		}
	});

	const response = new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});

	writer?.ready
		.then(async () => {
			const cart = await collections.carts.findOne(
				{ 'user.userId': userId },
				{ sort: { createdAt: -1 } }
			);
			if (cart) {
				ownCartId = cart._id;
			}
			const formattedCart = await formatCart(cart, locals);

			writer?.write(`data: ${JSON.stringify({ eventType: 'cart', cart: formattedCart })}\n\n`);

			const order = await collections.orders.findOne(
				{ 'user.userId': userId },
				{ sort: { createdAt: -1 } }
			);

			await writer?.ready;

			const formattedOrder = order ? formatOrder(order) : null;
			writer?.write(`data: ${JSON.stringify({ eventType: 'order', order: formattedOrder })}\n\n`);
		})
		.catch(() => cleanup());

	return response;
}
