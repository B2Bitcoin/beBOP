import { collections } from '$lib/server/database.js';
import type { OrderPaymentStatus } from '$lib/types/Order.js';
import { POS_ROLE_ID } from '$lib/types/User.js';
import { error } from '@sveltejs/kit';

export type SSEEventType = 'updateCart' | OrderPaymentStatus;

export async function GET({ locals }) {
	const userId = locals.user?._id;
	if (!userId) {
		throw error(401, 'Must be logged in');
	}

	if (locals.user?.role !== POS_ROLE_ID) {
		throw error(403, 'Must be logged in as a POS user');
	}

	//Check change on cart collection
	const cartCollection = collections.carts;
	const cartChangeStream = cartCollection.watch(
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

	cartChangeStream.on('change', (changeEvent) => {
		if (!('fullDocument' in changeEvent) || !changeEvent.fullDocument) {
			return;
		}
		try {
			writer.write(`data: ${JSON.stringify({ eventType: 'updateCart' })}\n\n`).catch((error) => {
				console.error(`Error writing to client ${userId}`, error);
				// Error writing to the client, assume it has disconnected
				writer.close();
				orderChangeStream.close();
				cartChangeStream.close();
			});
		} catch (error) {
			console.error('Error processing changeEvent:', error);
		}
	});

	//Check change on order collection
	const orderCollection = collections.orders;
	const orderChangeStream = orderCollection.watch(
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
		if (!('fullDocument' in changeEvent) || !changeEvent.fullDocument) {
			return;
		}
		try {
			const order = changeEvent.fullDocument;

			writer
				.write(`data: ${JSON.stringify({ eventType: order.lastPaymentStatusNotified })}\n\n`)
				.catch((error) => {
					console.error(`Error writing to client ${userId}`, error);
					// Error writing to the client, assume it has disconnected
					writer.close();
					orderChangeStream.close();
					cartChangeStream.close();
				});
		} catch (error) {
			console.error('Error processing changeEvent:', error);
		}
	});

	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const response = new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});

	return response;
}
