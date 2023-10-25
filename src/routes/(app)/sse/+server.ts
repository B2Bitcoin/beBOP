import { collections } from '$lib/server/database.js';
import type { Cart } from '$lib/types/Cart.js';
import type { Order } from '$lib/types/Order.js';

export async function GET({ locals }) {
	//Check change on cart collection
	const cartCollection = collections.carts;
	const cartChangeStream = cartCollection.watch(
		[
			{
				$match: {
					'fullDocument.user.userId': { $exists: true }
				}
			}
		],
		{
			fullDocument: 'updateLookup'
		}
	);

	cartChangeStream.on('change', (changeEvent: ChangeEvent & { fullDocument?: Cart }) => {
		try {
			const cart = changeEvent.fullDocument;

			if (cart?.user?.userId) {
				notifyClientsOfCartUpdate({ eventType: 'updateCart' }, cart.user.userId.toString());
			}
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
					'fullDocument.user.userId': { $exists: true }
				}
			}
		],
		{
			fullDocument: 'updateLookup'
		}
	);

	orderChangeStream.on('change', async (changeEvent: ChangeEvent & { fullDocument?: Order }) => {
		try {
			const order = changeEvent.fullDocument;

			if (order?.user?.userId) {
				notifyClientsOfCartUpdate(
					{ eventType: order.lastPaymentStatusNotified },
					order?.user?.userId.toString()
				);
			}
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

	const clientId = new Date().toISOString();

	if (!clients[clientId]) {
		clients[clientId] = new Set();
	}
	clients[clientId].add({ writer, userId: locals.user?._id?.toString() ?? '' });

	return response;
}

interface ClientConnection {
	writer: WritableStreamDefaultWriter;
	userId: string;
}

interface ChangeEvent {
	documentKey: {
		_id?: string;
	};
}

const clients: Record<string, Set<ClientConnection>> = {};

async function notifyClientsOfCartUpdate(
	data: { eventType: string | undefined },
	userIdToUpdate: string
): Promise<void> {
	for (const clientId in clients) {
		for (const connection of clients[clientId]) {
			if (connection.userId === userIdToUpdate) {
				connection.writer.write(`data: ${JSON.stringify(data)}\n\n`).catch((error) => {
					console.error(`Error writing to client ${clientId}`, error);
					// Error writing to the client, assume it has disconnected
					connection.writer.close();
					clients[clientId].delete(connection);

					if (clients[clientId].size === 0) {
						delete clients[clientId];
					}
				});
			}
		}
	}
}
