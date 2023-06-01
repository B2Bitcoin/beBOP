import { collections } from './database';

export async function generateSubscriptionNumber(): Promise<number> {
	const res = await collections.runtimeConfig.findOneAndUpdate(
		{ _id: 'subscriptionNumber' },
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ $inc: { data: 1 } as any },
		{ upsert: true, returnDocument: 'after' }
	);

	if (!res.value) {
		throw new Error('Failed to increment subscription number');
	}

	return res.value.data as number;
}
