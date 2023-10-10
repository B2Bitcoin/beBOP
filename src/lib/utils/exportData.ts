import { collections } from '../server/database';

export async function exportDatabase() {
	try {
		const challenges = await collections.challenges.find().toArray();

		return { challenges };
	} catch (error) {
		console.error('Error exporting database:', error);
		throw error;
	}
}
